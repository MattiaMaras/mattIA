import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import { publicEnv } from "@/lib/env"

/**
 * Browser Supabase client (publishable key). Used only for client-side
 * Storage uploads / public reads. All privileged data access goes through
 * server routes that use the admin client.
 */
export function createBrowserClient() {
  return createClient<Database>(
    publicEnv.supabaseUrl,
    publicEnv.supabaseAnonKey,
  )
}
