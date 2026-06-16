"use server"

import { requireUserId } from "@/lib/auth"
import { saveWhiteboardSnapshot } from "@/lib/whiteboards"
import type { Json } from "@/lib/database.types"

export async function saveWhiteboardAction(
  whiteboardId: string,
  snapshot: Json,
): Promise<void> {
  const userId = await requireUserId()
  await saveWhiteboardSnapshot(userId, whiteboardId, snapshot)
}
