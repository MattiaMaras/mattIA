"use server"

import { revalidatePath } from "next/cache"
import { requireUserId } from "@/lib/auth"
import {
  createNotebook,
  deleteNotebook,
  updateNotebook,
  type Notebook,
} from "@/lib/notebooks"

export async function createNotebookAction(
  sessionId: string,
  title?: string,
): Promise<Notebook> {
  const userId = await requireUserId()
  const nb = await createNotebook(userId, sessionId, { title })
  revalidatePath(`/session/${sessionId}`)
  return nb
}

export async function saveNotebookAction(
  sessionId: string,
  notebookId: string,
  patch: { title?: string; content?: string },
): Promise<void> {
  const userId = await requireUserId()
  await updateNotebook(userId, notebookId, patch)
  // No revalidate on autosave to avoid thrashing; the client holds state.
}

export async function deleteNotebookAction(
  sessionId: string,
  notebookId: string,
): Promise<void> {
  const userId = await requireUserId()
  await deleteNotebook(userId, notebookId)
  revalidatePath(`/session/${sessionId}`)
}
