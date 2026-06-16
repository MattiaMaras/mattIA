"use server"

import { revalidatePath } from "next/cache"
import { requireUserId } from "@/lib/auth"
import { deleteDocument } from "@/lib/documents"
import { ingestDocument, IngestError } from "@/lib/rag/ingest"

export async function deleteDocumentAction(
  sessionId: string,
  documentId: string,
): Promise<void> {
  const userId = await requireUserId()
  await deleteDocument(userId, documentId)
  revalidatePath(`/session/${sessionId}`)
}

export async function reprocessDocumentAction(
  sessionId: string,
  documentId: string,
): Promise<{ ok?: boolean; error?: string }> {
  const userId = await requireUserId()
  try {
    await ingestDocument(userId, documentId)
  } catch (err) {
    return {
      error: err instanceof IngestError ? err.message : "Elaborazione non riuscita",
    }
  }
  revalidatePath(`/session/${sessionId}`)
  return { ok: true }
}
