import "server-only"
import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import { publicEnv, serverEnv } from "@/lib/env"

/**
 * Server-side Supabase client using the service-role key.
 *
 * Authentication is handled by Clerk, so authorization is enforced in our
 * own server code (always scope queries by `clerk_user_id`). The service role
 * bypasses RLS — never import this from a Client Component.
 */
let cached: ReturnType<typeof createClient<Database>> | null = null

export function supabaseAdmin() {
  if (cached) return cached
  cached = createClient<Database>(
    publicEnv.supabaseUrl,
    serverEnv.supabaseServiceRoleKey,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  )
  return cached
}
