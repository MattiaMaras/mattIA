import "server-only"
import type { UIMessage } from "ai"
import { supabaseAdmin } from "@/lib/supabase/admin"
import type { Json, Tables, TablesInsert } from "@/lib/database.types"

export type ChatThread = Tables<"chat_threads">

/** Extract plain text from a UIMessage's parts (for the `content` fallback column). */
export function textFromParts(parts: unknown): string {
  if (!Array.isArray(parts)) return ""
  return parts
    .filter(
      (p): p is { type: string; text: string } =>
        !!p && typeof p === "object" && (p as { type?: string }).type === "text",
    )
    .map((p) => p.text)
    .join("\n")
}

export async function listThreads(
  clerkUserId: string,
  sessionId: string,
): Promise<ChatThread[]> {
  const { data, error } = await supabaseAdmin()
    .from("chat_threads")
    .select("*")
    .eq("clerk_user_id", clerkUserId)
    .eq("session_id", sessionId)
    .eq("archived", false)
    .order("updated_at", { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function createThread(
  clerkUserId: string,
  sessionId: string,
  opts: { modelProvider?: string | null; modelId?: string | null; title?: string } = {},
): Promise<ChatThread> {
  const { data, error } = await supabaseAdmin()
    .from("chat_threads")
    .insert({
      clerk_user_id: clerkUserId,
      session_id: sessionId,
      title: opts.title ?? "Nuova conversazione",
      model_provider: opts.modelProvider ?? null,
      model_id: opts.modelId ?? null,
    })
    .select("*")
    .single()
  if (error) throw error
  return data
}

/** Verify a thread belongs to the user (and session), returning it or null. */
export async function getThread(
  clerkUserId: string,
  threadId: string,
): Promise<ChatThread | null> {
  const { data, error } = await supabaseAdmin()
    .from("chat_threads")
    .select("*")
    .eq("id", threadId)
    .eq("clerk_user_id", clerkUserId)
    .maybeSingle()
  if (error) throw error
  return data
}

/** Load a thread's messages as AI SDK UIMessages, oldest first. */
export async function getThreadMessages(
  clerkUserId: string,
  threadId: string,
): Promise<UIMessage[]> {
  const { data, error } = await supabaseAdmin()
    .from("chat_messages")
    .select("id, role, parts")
    .eq("clerk_user_id", clerkUserId)
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true })
  if (error) throw error
  return (data ?? []).map((m) => ({
    id: m.id,
    role: m.role as UIMessage["role"],
    parts: (m.parts ?? []) as UIMessage["parts"],
  }))
}

export async function saveMessage(
  clerkUserId: string,
  threadId: string,
  message: {
    id?: string
    role: "user" | "assistant" | "system"
    parts: unknown
    modelProvider?: string | null
    modelId?: string | null
  },
): Promise<void> {
  const row: TablesInsert<"chat_messages"> = {
    thread_id: threadId,
    clerk_user_id: clerkUserId,
    role: message.role,
    parts: (message.parts ?? []) as Json,
    content: textFromParts(message.parts),
    model_provider: message.modelProvider ?? null,
    model_id: message.modelId ?? null,
  }
  if (message.id) row.id = message.id
  const { error } = await supabaseAdmin().from("chat_messages").insert(row)
  if (error) throw error
  // bump the thread's updated_at
  await supabaseAdmin()
    .from("chat_threads")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", threadId)
    .eq("clerk_user_id", clerkUserId)
}

export async function renameThread(
  clerkUserId: string,
  threadId: string,
  title: string,
): Promise<void> {
  const { error } = await supabaseAdmin()
    .from("chat_threads")
    .update({ title })
    .eq("id", threadId)
    .eq("clerk_user_id", clerkUserId)
  if (error) throw error
}

export async function deleteThread(
  clerkUserId: string,
  threadId: string,
): Promise<void> {
  const { error } = await supabaseAdmin()
    .from("chat_threads")
    .delete()
    .eq("id", threadId)
    .eq("clerk_user_id", clerkUserId)
  if (error) throw error
}

/** Count messages in a thread (used to decide when to auto-title). */
export async function countThreadMessages(
  clerkUserId: string,
  threadId: string,
): Promise<number> {
  const { count, error } = await supabaseAdmin()
    .from("chat_messages")
    .select("id", { count: "exact", head: true })
    .eq("clerk_user_id", clerkUserId)
    .eq("thread_id", threadId)
  if (error) throw error
  return count ?? 0
}
