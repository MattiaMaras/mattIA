"use server"

import { revalidatePath } from "next/cache"
import { requireUserId } from "@/lib/auth"
import { supabaseAdmin } from "@/lib/supabase/admin"
import {
  deleteUserApiKey,
  upsertUserApiKey,
} from "@/lib/ai/keys"
import { isProviderId } from "@/lib/ai/models"
import type { TablesUpdate } from "@/lib/database.types"

export type ActionResult = { error?: string; ok?: boolean }

export async function saveApiKeyAction(
  provider: string,
  key: string,
): Promise<ActionResult> {
  const userId = await requireUserId()
  if (!isProviderId(provider)) return { error: "Provider non valido" }
  const trimmed = key.trim()
  if (trimmed.length < 8) return { error: "La chiave sembra troppo corta" }

  try {
    await upsertUserApiKey(userId, provider, trimmed)
  } catch {
    return { error: "Salvataggio non riuscito. Riprova." }
  }
  revalidatePath("/settings")
  revalidatePath("/dashboard")
  return { ok: true }
}

export async function deleteApiKeyAction(provider: string): Promise<ActionResult> {
  const userId = await requireUserId()
  if (!isProviderId(provider)) return { error: "Provider non valido" }
  try {
    await deleteUserApiKey(userId, provider)
  } catch {
    return { error: "Eliminazione non riuscita." }
  }
  revalidatePath("/settings")
  revalidatePath("/dashboard")
  return { ok: true }
}

export async function setDefaultModelAction(
  provider: string,
  modelId: string,
): Promise<ActionResult> {
  const userId = await requireUserId()
  if (!isProviderId(provider)) return { error: "Provider non valido" }
  if (!modelId.trim()) return { error: "Modello non valido" }

  const { error } = await supabaseAdmin()
    .from("profiles")
    .update({ default_provider: provider, default_model: modelId.trim() })
    .eq("clerk_user_id", userId)
  if (error) return { error: "Salvataggio non riuscito." }

  revalidatePath("/settings")
  return { ok: true }
}

export async function updateProfileAction(input: {
  full_name?: string
  university?: string | null
  degree_program?: string | null
}): Promise<ActionResult> {
  const userId = await requireUserId()
  const patch: TablesUpdate<"profiles"> = {}
  if (input.full_name !== undefined) patch.full_name = input.full_name.trim()
  if (input.university !== undefined) patch.university = input.university || null
  if (input.degree_program !== undefined)
    patch.degree_program = input.degree_program || null

  const { error } = await supabaseAdmin()
    .from("profiles")
    .update(patch)
    .eq("clerk_user_id", userId)
  if (error) return { error: "Salvataggio non riuscito." }
  revalidatePath("/settings")
  return { ok: true }
}
