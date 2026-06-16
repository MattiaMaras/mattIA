import "server-only"
import { currentUser } from "@clerk/nextjs/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { DEFAULT_MODEL, DEFAULT_PROVIDER } from "@/lib/ai/models"
import type { Tables } from "@/lib/database.types"

export type Profile = Tables<"profiles">

/** Fetch the profile row for a Clerk user, or null if none exists yet. */
export async function getProfile(clerkUserId: string): Promise<Profile | null> {
  const { data, error } = await supabaseAdmin()
    .from("profiles")
    .select("*")
    .eq("clerk_user_id", clerkUserId)
    .maybeSingle()
  if (error) throw error
  return data
}

/**
 * Return the profile for the current Clerk user, creating a stub row on first
 * sign-in (pre-onboarding). Pulls name/email from Clerk.
 */
export async function getOrCreateProfile(): Promise<Profile> {
  const user = await currentUser()
  if (!user) throw new Error("No authenticated user")

  const existing = await getProfile(user.id)
  if (existing) return existing

  const email = user.primaryEmailAddress?.emailAddress ?? null
  const fullName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || null

  const { data, error } = await supabaseAdmin()
    .from("profiles")
    .insert({
      clerk_user_id: user.id,
      email,
      full_name: fullName,
      default_provider: DEFAULT_PROVIDER,
      default_model: DEFAULT_MODEL,
      onboarded: false,
    })
    .select("*")
    .single()

  if (error) {
    // Handle the race where a concurrent request created the row first.
    const retry = await getProfile(user.id)
    if (retry) return retry
    throw error
  }
  return data
}
