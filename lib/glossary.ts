import "server-only"
import { supabaseAdmin } from "@/lib/supabase/admin"
import type { Tables } from "@/lib/database.types"

export type GlossaryTerm = Tables<"glossary_terms">

export async function listGlossary(
  clerkUserId: string,
  sessionId: string,
): Promise<GlossaryTerm[]> {
  const { data, error } = await supabaseAdmin()
    .from("glossary_terms")
    .select("*")
    .eq("clerk_user_id", clerkUserId)
    .eq("session_id", sessionId)
    .order("term", { ascending: true })
  if (error) throw error
  return data ?? []
}

/** Upsert a generated set of terms, ignoring duplicates (unique session+term). */
export async function upsertTerms(
  clerkUserId: string,
  sessionId: string,
  terms: { term: string; definition: string }[],
): Promise<number> {
  if (terms.length === 0) return 0
  const rows = terms
    .filter((t) => t.term.trim() && t.definition.trim())
    .map((t) => ({
      clerk_user_id: clerkUserId,
      session_id: sessionId,
      term: t.term.trim(),
      definition: t.definition.trim(),
    }))
  const { error, count } = await supabaseAdmin()
    .from("glossary_terms")
    .upsert(rows, { onConflict: "session_id,term", count: "exact" })
  if (error) throw error
  return count ?? rows.length
}

export async function deleteTerm(
  clerkUserId: string,
  termId: string,
): Promise<void> {
  const { error } = await supabaseAdmin()
    .from("glossary_terms")
    .delete()
    .eq("id", termId)
    .eq("clerk_user_id", clerkUserId)
  if (error) throw error
}
