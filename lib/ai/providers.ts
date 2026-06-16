import "server-only"
import { createAnthropic } from "@ai-sdk/anthropic"
import { createOpenAI } from "@ai-sdk/openai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import type { EmbeddingModel, LanguageModel } from "ai"

import { ollamaBaseUrl, type ProviderId } from "./models"

/**
 * Build a language model instance from a provider id, model id and the user's
 * own API key (BYOK). Provider-agnostic surface over the Vercel AI SDK.
 */
export function getLanguageModel(
  provider: ProviderId,
  modelId: string,
  apiKey: string,
): LanguageModel {
  switch (provider) {
    case "anthropic":
      return createAnthropic({ apiKey })(modelId)
    case "openai":
      return createOpenAI({ apiKey })(modelId)
    case "google":
      return createGoogleGenerativeAI({ apiKey })(modelId)
    case "ollama":
      // `apiKey` carries the Ollama host URL for local providers.
      return createOpenAI({
        baseURL: ollamaBaseUrl(apiKey),
        apiKey: "ollama",
      })(modelId)
    default:
      throw new Error(`Unsupported provider: ${provider}`)
  }
}

/**
 * Build an embedding model for the RAG engine. OpenAI, Google and Ollama
 * are supported here (Anthropic has no first-party embeddings endpoint).
 */
export function getEmbeddingModel(
  provider: ProviderId,
  modelId: string,
  apiKey: string,
): EmbeddingModel {
  switch (provider) {
    case "openai":
      return createOpenAI({ apiKey }).textEmbeddingModel(modelId)
    case "google":
      return createGoogleGenerativeAI({ apiKey }).textEmbeddingModel(modelId)
    case "ollama":
      return createOpenAI({
        baseURL: ollamaBaseUrl(apiKey),
        apiKey: "ollama",
      }).textEmbeddingModel(modelId)
    default:
      throw new Error(`Provider ${provider} does not support embeddings`)
  }
}
