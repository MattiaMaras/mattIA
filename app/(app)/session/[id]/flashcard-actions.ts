"use server"

import { revalidatePath } from "next/cache"
import { requireUserId } from "@/lib/auth"
import {
  createFlashcards,
  deleteFlashcard,
  listFlashcards,
  reviewFlashcard,
  type Flashcard,
} from "@/lib/flashcards"
import { generateFlashcards, FlashcardError } from "@/lib/ai/flashcards"
import { schedule, type ReviewGrade } from "@/lib/srs"

export async function generateFlashcardsAction(
  sessionId: string,
  count: number,
): Promise<{ cards?: Flashcard[]; created?: number; error?: string }> {
  const userId = await requireUserId()
  try {
    const generated = await generateFlashcards(userId, sessionId, count)
    const created = await createFlashcards(userId, sessionId, generated)
    const cards = await listFlashcards(userId, sessionId)
    revalidatePath(`/session/${sessionId}/flashcards`)
    return { cards, created }
  } catch (err) {
    return {
      error:
        err instanceof FlashcardError ? err.message : "Generazione non riuscita",
    }
  }
}

export async function reviewFlashcardAction(
  cardId: string,
  current: { easeFactor: number; intervalDays: number; repetitions: number },
  grade: ReviewGrade,
): Promise<void> {
  const userId = await requireUserId()
  const update = schedule(current, grade)
  await reviewFlashcard(userId, cardId, update)
}

export async function deleteFlashcardAction(
  sessionId: string,
  cardId: string,
): Promise<void> {
  const userId = await requireUserId()
  await deleteFlashcard(userId, cardId)
  revalidatePath(`/session/${sessionId}/flashcards`)
}
