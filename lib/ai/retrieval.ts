import "server-only"
import { embed } from "ai"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { resolveEmbeddingProvider } from "@/lib/ai/keys"
import { getEmbeddingModel } from "@/lib/ai/providers"
import { EMBEDDING_DIMENSIONS, type ProviderId } from "@/lib/ai/models"
import { toVectorLiteral } from "@/lib/rag/vector"

/** Provider options needed to pin embeddings to the pgvector column size. */
export function embeddingProviderOptions(
  provider: ProviderId,
): Record<string, Record<string, number>> | undefined {
  switch (provider) {
    case "openai":
      return { openai: { dimensions: EMBEDDING_DIMENSIONS } }
    case "google":
      return { google: { outputDimensionality: EMBEDDING_DIMENSIONS } }
    // Ollama (nomic-embed-text) is natively 768-dim — no override needed.
    default:
      return undefined
  }
}

/** Embed a single piece of text into an EMBEDDING_DIMENSIONS-d vector. */
export async function embedText(
  provider: ProviderId,
  modelId: string,
  apiKey: string,
  text: string,
): Promise<number[]> {
  const { embedding } = await embed({
    model: getEmbeddingModel(provider, modelId, apiKey),
    value: text,
    providerOptions: embeddingProviderOptions(provider),
  })
  return embedding
}

/**
 * Retrieve relevant material chunks for a query, formatted as a context block.
 * Returns "" when the user has no embedding-capable key or no matching chunks,
 * so the tutor degrades gracefully to its general knowledge.
 */
export async function retrieveContext(
  clerkUserId: string,
  sessionId: string,
  query: string,
  matchCount = 6,
): Promise<string> {
  if (!query.trim()) return ""

  const emb = await resolveEmbeddingProvider(clerkUserId)
  if (!emb) return ""

  let queryEmbedding: number[]
  try {
    queryEmbedding = await embedText(
      emb.provider,
      emb.modelId,
      emb.apiKey,
      query,
    )
  } catch (err) {
    console.error("Embedding query failed", err)
    return ""
  }

  const { data, error } = await supabaseAdmin().rpc("match_document_chunks", {
    query_embedding: toVectorLiteral(queryEmbedding),
    p_session_id: sessionId,
    p_clerk_user_id: clerkUserId,
    match_count: matchCount,
    similarity_threshold: 0.2,
  })
  if (error) {
    console.error("match_document_chunks failed", error)
    return ""
  }
  if (!data || data.length === 0) return ""

  return data
    .map(
      (row: { content: string }, i: number) =>
        `[Estratto ${i + 1}]\n${row.content}`,
    )
    .join("\n\n")
}
