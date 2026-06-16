import "server-only"
import { supabaseAdmin } from "@/lib/supabase/admin"
import type { Tables } from "@/lib/database.types"

export type Notebook = Tables<"notebooks">

export async function listNotebooks(
  clerkUserId: string,
  sessionId: string,
): Promise<Notebook[]> {
  const { data, error } = await supabaseAdmin()
    .from("notebooks")
    .select("*")
    .eq("clerk_user_id", clerkUserId)
    .eq("session_id", sessionId)
    .order("updated_at", { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function createNotebook(
  clerkUserId: string,
  sessionId: string,
  input: { title?: string; content?: string } = {},
): Promise<Notebook> {
  const { data, error } = await supabaseAdmin()
    .from("notebooks")
    .insert({
      clerk_user_id: clerkUserId,
      session_id: sessionId,
      title: input.title?.trim() || "Taccuino",
      content: input.content ?? "",
    })
    .select("*")
    .single()
  if (error) throw error
  return data
}

export async function updateNotebook(
  clerkUserId: string,
  notebookId: string,
  patch: { title?: string; content?: string },
): Promise<void> {
  const { error } = await supabaseAdmin()
    .from("notebooks")
    .update(patch)
    .eq("id", notebookId)
    .eq("clerk_user_id", clerkUserId)
  if (error) throw error
}

export async function deleteNotebook(
  clerkUserId: string,
  notebookId: string,
): Promise<void> {
  const { error } = await supabaseAdmin()
    .from("notebooks")
    .delete()
    .eq("id", notebookId)
    .eq("clerk_user_id", clerkUserId)
  if (error) throw error
}
