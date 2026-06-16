/**
 * Centralised, validated access to environment variables.
 * Server-only secrets are read lazily so they never leak into the client bundle.
 */

function required(name: string, value: string | undefined): string {
  if (!value || value.length === 0) {
    throw new Error(
      `Missing required environment variable: ${name}. Add it to .env.local`,
    )
  }
  return value
}

/** Public (browser-safe) env. */
export const publicEnv = {
  supabaseUrl: required(
    "NEXT_PUBLIC_SUPABASE_URL",
    process.env.NEXT_PUBLIC_SUPABASE_URL,
  ),
  supabaseAnonKey: required(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  ),
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
}

/** Server-only env. Throws if read on the client. */
export const serverEnv = {
  get supabaseServiceRoleKey() {
    return required(
      "SUPABASE_SERVICE_ROLE_KEY",
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    )
  },
  get appEncryptionKey() {
    return required("APP_ENCRYPTION_KEY", process.env.APP_ENCRYPTION_KEY)
  },
}
