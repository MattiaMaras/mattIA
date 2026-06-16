import "server-only"
import { supabaseAdmin } from "@/lib/supabase/admin"
import type { SrsUpdate } from "@/lib/srs"
import type { Tables } from "@/lib/database.types"

export type Flashcard = Tables<"flashcards">

export async function listFlashcards(
  clerkUserId: string,
  sessionId: string,
): Promise<Flashcard[]> {
  const { data, error } = await supabaseAdmin()
    .from("flashcards")
    .select("*")
    .eq("clerk_user_id", clerkUserId)
    .eq("session_id", sessionId)
    .order("due_at", { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function countDue(
  clerkUserId: string,
  sessionId: string,
): Promise<number> {
  const { count, error } = await supabaseAdmin()
    .from("flashcards")
    .select("id", { count: "exact", head: true })
    .eq("clerk_user_id", clerkUserId)
    .eq("session_id", sessionId)
    .lte("due_at", new Date().toISOString())
  if (error) throw error
  return count ?? 0
}

export async function createFlashcards(
  clerkUserId: string,
  sessionId: string,
  cards: { front: string; back: string; topic?: string }[],
): Promise<number> {
  const rows = cards
    .filter((c) => c.front.trim() && c.back.trim())
    .map((c) => ({
      clerk_user_id: clerkUserId,
      session_id: sessionId,
      front: c.front.trim(),
      back: c.back.trim(),
      topic: c.topic?.trim() || null,
      source: "ai",
    }))
  if (rows.length === 0) return 0
  const { error } = await supabaseAdmin().from("flashcards").insert(rows)
  if (error) throw error
  return rows.length
}

export async function reviewFlashcard(
  clerkUserId: string,
  cardId: string,
  update: SrsUpdate,
): Promise<void> {
  const { error } = await supabaseAdmin()
    .from("flashcards")
    .update({
      ease_factor: update.easeFactor,
      interval_days: update.intervalDays,
      repetitions: update.repetitions,
      due_at: update.dueAt,
      last_reviewed_at: new Date().toISOString(),
    })
    .eq("id", cardId)
    .eq("clerk_user_id", clerkUserId)
  if (error) throw error
}

export async function deleteFlashcard(
  clerkUserId: string,
  cardId: string,
): Promise<void> {
  const { error } = await supabaseAdmin()
    .from("flashcards")
    .delete()
    .eq("id", cardId)
    .eq("clerk_user_id", clerkUserId)
  if (error) throw error
}
