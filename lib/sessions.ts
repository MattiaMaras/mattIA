import "server-only"
import { supabaseAdmin } from "@/lib/supabase/admin"
import type { Tables, TablesInsert } from "@/lib/database.types"

export type StudySession = Tables<"study_sessions">

/** List a user's study sessions, newest first (non-archived). */
export async function listSessions(
  clerkUserId: string,
): Promise<StudySession[]> {
  const { data, error } = await supabaseAdmin()
    .from("study_sessions")
    .select("*")
    .eq("clerk_user_id", clerkUserId)
    .eq("archived", false)
    .order("updated_at", { ascending: false })
  if (error) throw error
  return data ?? []
}

/** Fetch one session, scoped to the owner. Returns null if not found/owned. */
export async function getSession(
  clerkUserId: string,
  sessionId: string,
): Promise<StudySession | null> {
  const { data, error } = await supabaseAdmin()
    .from("study_sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("clerk_user_id", clerkUserId)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function createSession(
  clerkUserId: string,
  input: Pick<TablesInsert<"study_sessions">, "title" | "description" | "color" | "icon">,
): Promise<StudySession> {
  const { data, error } = await supabaseAdmin()
    .from("study_sessions")
    .insert({
      clerk_user_id: clerkUserId,
      title: input.title,
      description: input.description ?? null,
      color: input.color ?? "violet",
      icon: input.icon ?? "BookOpen",
    })
    .select("*")
    .single()
  if (error) throw error
  return data
}

export async function updateSession(
  clerkUserId: string,
  sessionId: string,
  patch: Partial<
    Pick<
      Tables<"study_sessions">,
      "title" | "description" | "color" | "icon" | "default_provider" | "default_model" | "archived"
    >
  >,
): Promise<void> {
  const { error } = await supabaseAdmin()
    .from("study_sessions")
    .update(patch)
    .eq("id", sessionId)
    .eq("clerk_user_id", clerkUserId)
  if (error) throw error
}

export async function deleteSession(
  clerkUserId: string,
  sessionId: string,
): Promise<void> {
  const { error } = await supabaseAdmin()
    .from("study_sessions")
    .delete()
    .eq("id", sessionId)
    .eq("clerk_user_id", clerkUserId)
  if (error) throw error
}
