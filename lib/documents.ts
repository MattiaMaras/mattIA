import "server-only"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { removeMaterial } from "@/lib/supabase/storage"
import type { Tables, TablesInsert, TablesUpdate } from "@/lib/database.types"

export type DocumentRow = Tables<"documents">

export async function listDocuments(
  clerkUserId: string,
  sessionId: string,
): Promise<DocumentRow[]> {
  const { data, error } = await supabaseAdmin()
    .from("documents")
    .select("*")
    .eq("clerk_user_id", clerkUserId)
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getDocument(
  clerkUserId: string,
  documentId: string,
): Promise<DocumentRow | null> {
  const { data, error } = await supabaseAdmin()
    .from("documents")
    .select("*")
    .eq("id", documentId)
    .eq("clerk_user_id", clerkUserId)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function createDocument(
  input: TablesInsert<"documents">,
): Promise<DocumentRow> {
  const { data, error } = await supabaseAdmin()
    .from("documents")
    .insert(input)
    .select("*")
    .single()
  if (error) throw error
  return data
}

export async function updateDocument(
  clerkUserId: string,
  documentId: string,
  patch: TablesUpdate<"documents">,
): Promise<void> {
  const { error } = await supabaseAdmin()
    .from("documents")
    .update(patch)
    .eq("id", documentId)
    .eq("clerk_user_id", clerkUserId)
  if (error) throw error
}

export async function deleteDocument(
  clerkUserId: string,
  documentId: string,
): Promise<void> {
  const doc = await getDocument(clerkUserId, documentId)
  if (!doc) return
  if (doc.storage_path) {
    try {
      await removeMaterial(doc.storage_path)
    } catch {
      /* best-effort: continue removing the row even if storage delete fails */
    }
  }
  // document_chunks cascade-delete via FK.
  const { error } = await supabaseAdmin()
    .from("documents")
    .delete()
    .eq("id", documentId)
    .eq("clerk_user_id", clerkUserId)
  if (error) throw error
}
