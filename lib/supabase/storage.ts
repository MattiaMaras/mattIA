import "server-only"
import { supabaseAdmin } from "@/lib/supabase/admin"

export const MATERIALS_BUCKET = "materials"

/** Storage object path for a material: {user}/{session}/{document}/{filename}. */
export function materialPath(
  clerkUserId: string,
  sessionId: string,
  documentId: string,
  filename: string,
): string {
  const safe = filename.replace(/[^\w.\-]+/g, "_")
  return `${clerkUserId}/${sessionId}/${documentId}/${safe}`
}

export async function uploadMaterial(
  path: string,
  body: ArrayBuffer | Buffer | Uint8Array,
  contentType: string,
): Promise<void> {
  const { error } = await supabaseAdmin()
    .storage.from(MATERIALS_BUCKET)
    .upload(path, body, { contentType, upsert: true })
  if (error) throw error
}

export async function downloadMaterial(path: string): Promise<ArrayBuffer> {
  const { data, error } = await supabaseAdmin()
    .storage.from(MATERIALS_BUCKET)
    .download(path)
  if (error) throw error
  return data.arrayBuffer()
}

export async function createMaterialSignedUrl(
  path: string,
  expiresInSeconds = 60 * 10,
): Promise<string> {
  const { data, error } = await supabaseAdmin()
    .storage.from(MATERIALS_BUCKET)
    .createSignedUrl(path, expiresInSeconds)
  if (error) throw error
  return data.signedUrl
}

export async function removeMaterial(path: string): Promise<void> {
  const { error } = await supabaseAdmin()
    .storage.from(MATERIALS_BUCKET)
    .remove([path])
  if (error) throw error
}
