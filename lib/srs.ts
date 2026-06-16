/**
 * SM-2 spaced-repetition scheduling (SuperMemo 2 / Anki-like).
 * Grade quality: 0 = total blackout … 5 = perfect recall.
 * We expose 4 UI grades mapped to qualities below.
 */

export type ReviewGrade = "again" | "hard" | "good" | "easy"

export const GRADE_QUALITY: Record<ReviewGrade, number> = {
  again: 1,
  hard: 3,
  good: 4,
  easy: 5,
}

export interface SrsState {
  easeFactor: number
  intervalDays: number
  repetitions: number
}

export interface SrsUpdate extends SrsState {
  dueAt: string // ISO timestamp
}

export function schedule(state: SrsState, grade: ReviewGrade): SrsUpdate {
  const q = GRADE_QUALITY[grade]
  let { easeFactor, intervalDays, repetitions } = state

  if (q < 3) {
    // Lapse: reset repetitions, review again soon.
    repetitions = 0
    intervalDays = 1
  } else {
    repetitions += 1
    if (repetitions === 1) intervalDays = 1
    else if (repetitions === 2) intervalDays = 6
    else intervalDays = Math.round(intervalDays * easeFactor)
  }

  // Update ease factor (clamped at 1.3).
  easeFactor = Math.max(
    1.3,
    easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)),
  )

  // "Hard" nudges the interval down a touch.
  if (grade === "hard") intervalDays = Math.max(1, Math.round(intervalDays * 0.8))

  const due = new Date()
  due.setDate(due.getDate() + intervalDays)

  return {
    easeFactor: Math.round(easeFactor * 100) / 100,
    intervalDays,
    repetitions,
    dueAt: due.toISOString(),
  }
}
