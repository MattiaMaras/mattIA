import "server-only"
import { embedMany, generateText } from "ai"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { downloadMaterial } from "@/lib/supabase/storage"
import { getDocument, updateDocument } from "@/lib/documents"
import { getProfile } from "@/lib/profile"
import { getUserApiKey, resolveEmbeddingProvider } from "@/lib/ai/keys"
import { getEmbeddingModel, getLanguageModel } from "@/lib/ai/providers"
import { embeddingProviderOptions } from "@/lib/ai/retrieval"
import { classifyMime, decodeText, extractPdfText } from "@/lib/rag/extract"
import { chunkText } from "@/lib/rag/chunk"
import { toVectorLiteral } from "@/lib/rag/vector"
import {
  DEFAULT_MODEL,
  DEFAULT_PROVIDER,
  isProviderId,
  type ProviderId,
} from "@/lib/ai/models"
import type { TablesInsert } from "@/lib/database.types"

const EMBED_BATCH = 96
const INSERT_BATCH = 200

export class IngestError extends Error {}

/**
 * Process a previously-uploaded document: extract text, chunk, embed, and store
 * chunks for RAG. Updates the document's status throughout. Throws IngestError
 * with a user-facing message on failure (also persisted to documents.error).
 */
export async function ingestDocument(
  clerkUserId: string,
  documentId: string,
): Promise<{ chunkCount: number }> {
  const doc = await getDocument(clerkUserId, documentId)
  if (!doc) throw new IngestError("Documento non trovato")
  if (!doc.storage_path) throw new IngestError("File mancante")

  await updateDocument(clerkUserId, documentId, {
    status: "processing",
    error: null,
  })

  try {
    const buffer = await downloadMaterial(doc.storage_path)
    const kind = classifyMime(doc.mime_type ?? "", doc.name)

    let text = ""
    if (kind === "pdf") {
      text = await extractPdfText(buffer)
    } else if (kind === "text") {
      text = decodeText(buffer)
    } else if (kind === "image") {
      text = await extractImageText(clerkUserId, buffer, doc.mime_type ?? "image/png")
    } else {
      // best effort: try to decode as text
      text = decodeText(buffer)
    }

    text = text.trim()
    if (!text) {
      throw new IngestError(
        "Nessun testo estraibile da questo file. Se è una scansione, prova con un PDF con testo selezionabile.",
      )
    }

    const chunks = chunkText(text)
    if (chunks.length === 0) throw new IngestError("Nessun contenuto da indicizzare")

    const emb = await resolveEmbeddingProvider(clerkUserId)
    if (!emb) {
      throw new IngestError(
        "Per indicizzare i materiali serve una chiave OpenAI o Google (gli embedding non sono disponibili con Anthropic). Aggiungila nelle Impostazioni.",
      )
    }

    const model = getEmbeddingModel(emb.provider, emb.modelId, emb.apiKey)
    const providerOptions = embeddingProviderOptions(emb.provider)

    // Embed in batches.
    const embeddings: number[][] = []
    for (let i = 0; i < chunks.length; i += EMBED_BATCH) {
      const batch = chunks.slice(i, i + EMBED_BATCH)
      const { embeddings: batchEmb } = await embedMany({
        model,
        values: batch.map((c) => c.content),
        providerOptions,
      })
      embeddings.push(...batchEmb)
    }

    // Replace any existing chunks for idempotent re-processing.
    await supabaseAdmin()
      .from("document_chunks")
      .delete()
      .eq("document_id", documentId)
      .eq("clerk_user_id", clerkUserId)

    const rows: TablesInsert<"document_chunks">[] = chunks.map((c, i) => ({
      document_id: documentId,
      session_id: doc.session_id,
      clerk_user_id: clerkUserId,
      chunk_index: c.index,
      content: c.content,
      token_count: c.tokenEstimate,
      embedding: toVectorLiteral(embeddings[i]) as unknown as string,
    }))

    for (let i = 0; i < rows.length; i += INSERT_BATCH) {
      const { error } = await supabaseAdmin()
        .from("document_chunks")
        .insert(rows.slice(i, i + INSERT_BATCH))
      if (error) throw new IngestError("Salvataggio dei chunk non riuscito")
    }

    await updateDocument(clerkUserId, documentId, {
      status: "ready",
      chunk_count: chunks.length,
      type: kind,
      error: null,
    })

    return { chunkCount: chunks.length }
  } catch (err) {
    const message =
      err instanceof IngestError
        ? err.message
        : "Elaborazione non riuscita. Riprova."
    await updateDocument(clerkUserId, documentId, {
      status: "error",
      error: message,
    })
    throw err instanceof IngestError ? err : new IngestError(message)
  }
}

/** Use the user's default (multimodal) chat model to extract text from an image. */
async function extractImageText(
  clerkUserId: string,
  buffer: ArrayBuffer,
  mediaType: string,
): Promise<string> {
  const profile = await getProfile(clerkUserId)
  const provider: ProviderId =
    profile?.default_provider && isProviderId(profile.default_provider)
      ? profile.default_provider
      : DEFAULT_PROVIDER
  const modelId = profile?.default_model || DEFAULT_MODEL
  const apiKey = await getUserApiKey(clerkUserId, provider)
  if (!apiKey) {
    throw new IngestError(
      "Per leggere le immagini serve una chiave AI configurata nelle Impostazioni.",
    )
  }

  const { text } = await generateText({
    model: getLanguageModel(provider, modelId, apiKey),
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Trascrivi fedelmente TUTTO il testo presente in questa immagine (appunti, formule in LaTeX, codice, diagrammi descritti). Non aggiungere commenti.",
          },
          { type: "image", image: new Uint8Array(buffer), mediaType },
        ],
      },
    ],
  })
  return text
}
