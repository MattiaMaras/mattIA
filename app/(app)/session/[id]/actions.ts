"use server"

import { revalidatePath } from "next/cache"
import { requireUserId } from "@/lib/auth"
import { getSession } from "@/lib/sessions"
import { createThread, deleteThread, renameThread } from "@/lib/chat"

export async function createThreadAction(
  sessionId: string,
): Promise<{ threadId?: string; error?: string }> {
  const userId = await requireUserId()
  const session = await getSession(userId, sessionId)
  if (!session) return { error: "Sessione non trovata" }

  const thread = await createThread(userId, sessionId, {
    modelProvider: session.default_provider,
    modelId: session.default_model,
  })
  revalidatePath(`/session/${sessionId}`)
  return { threadId: thread.id }
}

export async function deleteThreadAction(
  sessionId: string,
  threadId: string,
): Promise<void> {
  const userId = await requireUserId()
  await deleteThread(userId, threadId)
  revalidatePath(`/session/${sessionId}`)
}

export async function renameThreadAction(
  sessionId: string,
  threadId: string,
  title: string,
): Promise<void> {
  const userId = await requireUserId()
  await renameThread(userId, threadId, title.trim() || "Conversazione")
  revalidatePath(`/session/${sessionId}`)
}
