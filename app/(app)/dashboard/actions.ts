"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { requireUserId } from "@/lib/auth"
import {
  createSession,
  deleteSession,
  updateSession,
} from "@/lib/sessions"

const createSchema = z.object({
  title: z.string().trim().min(1, "Il titolo è obbligatorio").max(120),
  description: z.string().trim().max(400).optional().or(z.literal("")),
  color: z.string().trim().max(20).optional(),
  icon: z.string().trim().max(40).optional(),
})

export type SessionFormState = { error?: string; ok?: boolean }

export async function createSessionAction(
  _prev: SessionFormState,
  formData: FormData,
): Promise<SessionFormState> {
  const userId = await requireUserId()
  const parsed = createSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    color: formData.get("color"),
    icon: formData.get("icon"),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dati non validi" }
  }

  await createSession(userId, {
    title: parsed.data.title,
    description: parsed.data.description || null,
    color: parsed.data.color || "violet",
    icon: parsed.data.icon || "BookOpen",
  })
  revalidatePath("/dashboard")
  return { ok: true }
}

export async function updateSessionAction(
  sessionId: string,
  patch: { title?: string; description?: string | null; color?: string; icon?: string },
): Promise<void> {
  const userId = await requireUserId()
  await updateSession(userId, sessionId, patch)
  revalidatePath("/dashboard")
  revalidatePath(`/session/${sessionId}`)
}

export async function deleteSessionAction(sessionId: string): Promise<void> {
  const userId = await requireUserId()
  await deleteSession(userId, sessionId)
  revalidatePath("/dashboard")
}
