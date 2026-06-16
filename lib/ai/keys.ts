import "server-only"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { decryptSecret, encryptSecret } from "@/lib/crypto"
import {
  DEFAULT_MODEL,
  DEFAULT_PROVIDER,
  EMBEDDING_PROVIDERS,
  PROVIDERS,
  isProviderId,
  type ProviderId,
} from "./models"

export type ApiKeyStatus = { provider: ProviderId; last4: string | null }

/** List configured providers with a masked hint (last 4 chars), for the UI. */
export async function getApiKeyStatuses(
  clerkUserId: string,
): Promise<ApiKeyStatus[]> {
  const { data, error } = await supabaseAdmin()
    .from("user_api_keys")
    .select("provider, last4")
    .eq("clerk_user_id", clerkUserId)
  if (error) throw error
  return (data ?? [])
    .filter((r) => r.provider in PROVIDERS)
    .map((r) => ({ provider: r.provider as ProviderId, last4: r.last4 }))
}

/** Encrypt and upsert a user's API key for a provider. */
export async function upsertUserApiKey(
  clerkUserId: string,
  provider: ProviderId,
  plaintextKey: string,
): Promise<void> {
  const key = plaintextKey.trim()
  const enc = encryptSecret(key)
  const last4 = key.slice(-4)
  const { error } = await supabaseAdmin()
    .from("user_api_keys")
    .upsert(
      {
        clerk_user_id: clerkUserId,
        provider,
        ciphertext: enc.ciphertext,
        iv: enc.iv,
        auth_tag: enc.authTag,
        last4,
      },
      { onConflict: "clerk_user_id,provider" },
    )
  if (error) throw error
}

export async function deleteUserApiKey(
  clerkUserId: string,
  provider: ProviderId,
): Promise<void> {
  const { error } = await supabaseAdmin()
    .from("user_api_keys")
    .delete()
    .eq("clerk_user_id", clerkUserId)
    .eq("provider", provider)
  if (error) throw error
}

/** Return the decrypted API key for a user+provider, or null if not stored. */
export async function getUserApiKey(
  clerkUserId: string,
  provider: ProviderId,
): Promise<string | null> {
  const { data, error } = await supabaseAdmin()
    .from("user_api_keys")
    .select("ciphertext, iv, auth_tag")
    .eq("clerk_user_id", clerkUserId)
    .eq("provider", provider)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  return decryptSecret({
    ciphertext: data.ciphertext,
    iv: data.iv,
    authTag: data.auth_tag,
  })
}

/** List the providers for which the user has stored a key. */
export async function getConfiguredProviders(
  clerkUserId: string,
): Promise<ProviderId[]> {
  const { data, error } = await supabaseAdmin()
    .from("user_api_keys")
    .select("provider")
    .eq("clerk_user_id", clerkUserId)

  if (error) throw error
  return (data ?? [])
    .map((r) => r.provider)
    .filter((p): p is ProviderId => p in PROVIDERS)
}

/**
 * Resolve the user's default chat model + key. Falls back to the first
 * configured provider if the default has no key. Returns null if no key at all.
 */
export async function resolveUserChatModel(
  clerkUserId: string,
): Promise<{ provider: ProviderId; modelId: string; apiKey: string } | null> {
  const { data } = await supabaseAdmin()
    .from("profiles")
    .select("default_provider, default_model")
    .eq("clerk_user_id", clerkUserId)
    .maybeSingle()

  const preferred: ProviderId =
    data?.default_provider && isProviderId(data.default_provider)
      ? data.default_provider
      : DEFAULT_PROVIDER

  const configured = await getConfiguredProviders(clerkUserId)
  const order = [preferred, ...configured.filter((p) => p !== preferred)]

  for (const provider of order) {
    const apiKey = await getUserApiKey(clerkUserId, provider)
    if (apiKey) {
      const modelId =
        provider === preferred ? data?.default_model || DEFAULT_MODEL : DEFAULT_MODEL
      return { provider, modelId, apiKey }
    }
  }
  return null
}

/**
 * Pick an embedding-capable provider the user has configured, returning the
 * decrypted key and the provider's embedding model id. Prefers OpenAI.
 */
export async function resolveEmbeddingProvider(
  clerkUserId: string,
): Promise<{ provider: ProviderId; modelId: string; apiKey: string } | null> {
  const configured = await getConfiguredProviders(clerkUserId)
  const candidates = EMBEDDING_PROVIDERS.filter((p) => configured.includes(p))
  for (const provider of candidates) {
    const apiKey = await getUserApiKey(clerkUserId, provider)
    const modelId = PROVIDERS[provider].embeddingModel?.id
    if (apiKey && modelId) return { provider, modelId, apiKey }
  }
  return null
}
