import "server-only"
import { supabaseAdmin } from "@/lib/supabase/admin"
import type { Json, Tables } from "@/lib/database.types"

export type Whiteboard = Tables<"whiteboards">

/** Return the session's whiteboard, creating an empty one on first access. */
export async function getOrCreateWhiteboard(
  clerkUserId: string,
  sessionId: string,
): Promise<Whiteboard> {
  const { data, error } = await supabaseAdmin()
    .from("whiteboards")
    .select("*")
    .eq("clerk_user_id", clerkUserId)
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  if (data) return data

  const { data: created, error: insErr } = await supabaseAdmin()
    .from("whiteboards")
    .insert({
      clerk_user_id: clerkUserId,
      session_id: sessionId,
      title: "Lavagna",
    })
    .select("*")
    .single()
  if (insErr) throw insErr
  return created
}

export async function saveWhiteboardSnapshot(
  clerkUserId: string,
  whiteboardId: string,
  snapshot: Json,
): Promise<void> {
  const { error } = await supabaseAdmin()
    .from("whiteboards")
    .update({ snapshot })
    .eq("id", whiteboardId)
    .eq("clerk_user_id", clerkUserId)
  if (error) throw error
}
