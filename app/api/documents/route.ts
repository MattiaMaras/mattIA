import { getUserId } from "@/lib/auth"
import { getSession } from "@/lib/sessions"
import { createDocument, getDocument, updateDocument } from "@/lib/documents"
import { ingestDocument, IngestError } from "@/lib/rag/ingest"
import { materialPath, uploadMaterial } from "@/lib/supabase/storage"
import { classifyMime } from "@/lib/rag/extract"

export const maxDuration = 120

const MAX_BYTES = 25 * 1024 * 1024 // 25 MB

export async function POST(req: Request) {
  const userId = await getUserId()
  if (!userId) return Response.json({ error: "Non autenticato" }, { status: 401 })

  const form = await req.formData()
  const file = form.get("file")
  const sessionId = String(form.get("sessionId") ?? "")
  const kind = String(form.get("kind") ?? "material")

  if (!(file instanceof File)) {
    return Response.json({ error: "File mancante" }, { status: 400 })
  }
  if (!sessionId) {
    return Response.json({ error: "Sessione mancante" }, { status: 400 })
  }
  if (file.size > MAX_BYTES) {
    return Response.json(
      { error: "File troppo grande (max 25 MB)" },
      { status: 400 },
    )
  }

  const session = await getSession(userId, sessionId)
  if (!session) {
    return Response.json({ error: "Sessione non trovata" }, { status: 404 })
  }

  const mimeType = file.type || "application/octet-stream"
  const type = classifyMime(mimeType, file.name)

  // 1) Create the document row (pending) to obtain an id for the storage path.
  const doc = await createDocument({
    session_id: sessionId,
    clerk_user_id: userId,
    name: file.name,
    kind: kind === "exam_track" ? "exam_track" : "material",
    type,
    mime_type: mimeType,
    size_bytes: file.size,
    status: "pending",
  })

  // 2) Upload to private storage.
  const path = materialPath(userId, sessionId, doc.id, file.name)
  try {
    const buffer = await file.arrayBuffer()
    await uploadMaterial(path, buffer, mimeType)
    await updateDocument(userId, doc.id, { storage_path: path })
  } catch {
    await updateDocument(userId, doc.id, {
      status: "error",
      error: "Caricamento del file non riuscito",
    })
    return Response.json({ error: "Caricamento non riuscito" }, { status: 500 })
  }

  // 3) Ingest (extract → chunk → embed). Errors are persisted on the doc.
  try {
    await ingestDocument(userId, doc.id)
  } catch (err) {
    const message =
      err instanceof IngestError ? err.message : "Elaborazione non riuscita"
    const updated = await getDocument(userId, doc.id)
    return Response.json({ document: updated, error: message }, { status: 200 })
  }

  const updated = await getDocument(userId, doc.id)
  return Response.json({ document: updated }, { status: 200 })
}
