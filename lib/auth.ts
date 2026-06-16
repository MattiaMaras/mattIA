import "server-only"
import { auth } from "@clerk/nextjs/server"

/** Get the current Clerk user id, or null if signed out. */
export async function getUserId(): Promise<string | null> {
  const { userId } = await auth()
  return userId
}

/** Get the current Clerk user id, throwing if unauthenticated (use in API routes). */
export async function requireUserId(): Promise<string> {
  const { userId } = await auth()
  if (!userId) throw new UnauthorizedError()
  return userId
}

export class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized")
    this.name = "UnauthorizedError"
  }
}
