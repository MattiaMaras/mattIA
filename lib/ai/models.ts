/**
 * Provider-agnostic model catalog for mattIA's "Bring Your Own Key" system.
 *
 * The UI reads this catalog to render the provider/model pickers. Users may
 * also type a custom model id for any provider (e.g. a freshly released model),
 * so this list is a curated convenience, not a hard limit.
 */

export type ProviderId = "anthropic" | "openai" | "google" | "ollama"

export interface ModelInfo {
  id: string
  label: string
  description?: string
  recommended?: boolean
}

export interface ProviderInfo {
  id: ProviderId
  label: string
  docsUrl: string
  /** Human hint shown next to the key/host input. */
  keyHint: string
  models: ModelInfo[]
  /** Embedding model used for RAG (output forced to EMBEDDING_DIMENSIONS). */
  embeddingModel?: { id: string; dimensions: number }
  /** Local provider (Ollama): uses a host URL instead of a secret API key. */
  local?: boolean
  /** Default host for local providers. */
  defaultHost?: string
  /** Whether the user can type a custom model id (true for Ollama). */
  allowCustomModel?: boolean
}

export const PROVIDERS: Record<ProviderId, ProviderInfo> = {
  anthropic: {
    id: "anthropic",
    label: "Anthropic",
    docsUrl: "https://console.anthropic.com/settings/keys",
    keyHint: "sk-ant-…",
    models: [
      {
        id: "claude-opus-4-8",
        label: "Claude Opus 4.8",
        description: "Massima capacità di ragionamento, ideale per problemi complessi.",
      },
      {
        id: "claude-sonnet-4-6",
        label: "Claude Sonnet 4.6",
        description: "Ottimo equilibrio tra qualità e velocità.",
        recommended: true,
      },
      {
        id: "claude-haiku-4-5-20251001",
        label: "Claude Haiku 4.5",
        description: "Veloce ed economico per ripasso e domande rapide.",
      },
    ],
  },
  openai: {
    id: "openai",
    label: "OpenAI",
    docsUrl: "https://platform.openai.com/api-keys",
    keyHint: "sk-…",
    models: [
      { id: "gpt-5", label: "GPT-5", description: "Modello di punta OpenAI." },
      {
        id: "gpt-5-mini",
        label: "GPT-5 mini",
        description: "Più rapido ed economico.",
        recommended: true,
      },
      { id: "gpt-4.1", label: "GPT-4.1" },
      { id: "o4-mini", label: "o4-mini", description: "Reasoning compatto." },
    ],
    embeddingModel: { id: "text-embedding-3-small", dimensions: 768 },
  },
  google: {
    id: "google",
    label: "Google Gemini",
    docsUrl: "https://aistudio.google.com/app/apikey",
    keyHint: "AIza…",
    models: [
      {
        id: "gemini-2.5-pro",
        label: "Gemini 2.5 Pro",
        description: "Massima qualità, contesto enorme.",
      },
      {
        id: "gemini-2.5-flash",
        label: "Gemini 2.5 Flash",
        description: "Veloce e conveniente.",
        recommended: true,
      },
      { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
    ],
    embeddingModel: { id: "gemini-embedding-001", dimensions: 768 },
  },
  ollama: {
    id: "ollama",
    label: "Ollama (locale)",
    docsUrl: "https://ollama.com/library",
    keyHint: "http://localhost:11434",
    local: true,
    defaultHost: "http://localhost:11434",
    allowCustomModel: true,
    models: [
      {
        id: "llama3.2",
        label: "Llama 3.2",
        description: "Leggero e veloce, gira su quasi tutti i Mac.",
        recommended: true,
      },
      { id: "llama3.1", label: "Llama 3.1 (8B)" },
      { id: "qwen2.5", label: "Qwen 2.5" },
      { id: "gemma2", label: "Gemma 2" },
      { id: "mistral", label: "Mistral" },
      { id: "phi3.5", label: "Phi 3.5" },
      { id: "deepseek-r1", label: "DeepSeek-R1", description: "Reasoning locale." },
    ],
    // Pull with: `ollama pull nomic-embed-text` (768-dim, free & local).
    embeddingModel: { id: "nomic-embed-text", dimensions: 768 },
  },
}

export const PROVIDER_LIST = Object.values(PROVIDERS)

export const DEFAULT_PROVIDER: ProviderId = "anthropic"
export const DEFAULT_MODEL = "claude-sonnet-4-6"

/** Embedding vector size — must match the `document_chunks.embedding` column. */
export const EMBEDDING_DIMENSIONS = 768 as const

/** Providers capable of producing embeddings for the RAG engine (local first). */
export const EMBEDDING_PROVIDERS: ProviderId[] = ["ollama", "openai", "google"]

export function findModelLabel(provider: string, modelId: string): string {
  const p = PROVIDERS[provider as ProviderId]
  const m = p?.models.find((x) => x.id === modelId)
  return m?.label ?? modelId
}

export function isProviderId(value: string): value is ProviderId {
  return (
    value === "anthropic" ||
    value === "openai" ||
    value === "google" ||
    value === "ollama"
  )
}

/** Normalize an Ollama host into a clean base URL with the /v1 suffix. */
export function ollamaBaseUrl(host: string): string {
  let h = host.trim().replace(/\/+$/, "")
  if (!/^https?:\/\//.test(h)) h = `http://${h}`
  if (!h.endsWith("/v1")) h = `${h}/v1`
  return h
}
