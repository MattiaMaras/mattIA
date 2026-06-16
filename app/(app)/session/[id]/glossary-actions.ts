"use server"

import { revalidatePath } from "next/cache"
import { requireUserId } from "@/lib/auth"
import { deleteTerm, listGlossary, upsertTerms, type GlossaryTerm } from "@/lib/glossary"
import { generateGlossary, GlossaryError } from "@/lib/ai/glossary"

export async function generateGlossaryAction(
  sessionId: string,
): Promise<{ terms?: GlossaryTerm[]; error?: string }> {
  const userId = await requireUserId()
  try {
    const generated = await generateGlossary(userId, sessionId)
    await upsertTerms(userId, sessionId, generated)
    const terms = await listGlossary(userId, sessionId)
    revalidatePath(`/session/${sessionId}`)
    return { terms }
  } catch (err) {
    return {
      error:
        err instanceof GlossaryError ? err.message : "Generazione non riuscita",
    }
  }
}

export async function deleteTermAction(
  sessionId: string,
  termId: string,
): Promise<void> {
  const userId = await requireUserId()
  await deleteTerm(userId, termId)
  revalidatePath(`/session/${sessionId}`)
}
