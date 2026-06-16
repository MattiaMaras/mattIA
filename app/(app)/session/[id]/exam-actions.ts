"use server"

import { revalidatePath } from "next/cache"
import { requireUserId } from "@/lib/auth"
import {
  createSimulation,
  deleteSimulation,
  getSimulation,
  saveAttempt,
  type ExamAnswer,
  type ExamQuestion,
  type ExamSimulation,
} from "@/lib/exams"
import { generateExam, gradeOpenAnswers, ExamError } from "@/lib/ai/exam"

export async function generateExamAction(
  sessionId: string,
  opts: { numQuestions?: number; difficulty?: "facile" | "medio" | "difficile" },
): Promise<{ simulation?: ExamSimulation; error?: string }> {
  const userId = await requireUserId()
  try {
    const { title, questions } = await generateExam(userId, sessionId, opts)
    const sim = await createSimulation(userId, sessionId, { title, questions })
    revalidatePath(`/session/${sessionId}/exam`)
    return { simulation: sim }
  } catch (err) {
    return {
      error: err instanceof ExamError ? err.message : "Generazione non riuscita",
    }
  }
}

export interface ExamResult {
  score: number
  earned: number
  total: number
  answers: ExamAnswer[]
  topicScores: Record<string, number>
}

export async function submitExamAction(
  sessionId: string,
  simulationId: string,
  rawAnswers: ExamAnswer[],
  durationSeconds: number,
): Promise<{ result?: ExamResult; error?: string }> {
  const userId = await requireUserId()
  const sim = await getSimulation(userId, simulationId)
  if (!sim) return { error: "Simulazione non trovata" }

  const questions = (sim.questions as unknown as ExamQuestion[]) ?? []
  const answerMap = new Map(rawAnswers.map((a) => [a.questionId, a]))

  // AI-grade open answers.
  const openGrades = await gradeOpenAnswers(userId, questions, rawAnswers)

  const graded: ExamAnswer[] = []
  const topicAgg = new Map<string, { earned: number; total: number }>()
  let earned = 0
  let total = 0

  for (const q of questions) {
    total += q.points
    const a = answerMap.get(q.id)
    let awarded = 0
    let feedback: string | undefined

    if (q.type === "mcq") {
      if (a?.selectedOption != null && a.selectedOption === q.correctOption) {
        awarded = q.points
      }
    } else {
      const g = openGrades[q.id]
      const ratio = g?.score ?? 0
      awarded = Math.round(ratio * q.points * 100) / 100
      feedback = g?.feedback
    }

    earned += awarded
    const agg = topicAgg.get(q.topic) ?? { earned: 0, total: 0 }
    agg.earned += awarded
    agg.total += q.points
    topicAgg.set(q.topic, agg)

    graded.push({
      questionId: q.id,
      selectedOption: a?.selectedOption ?? null,
      text: a?.text,
      awarded,
      feedback,
    })
  }

  const score = total > 0 ? Math.round((earned / total) * 100) : 0
  const topicScores: Record<string, number> = {}
  for (const [topic, agg] of topicAgg) {
    topicScores[topic] = agg.total > 0 ? agg.earned / agg.total : 0
  }

  await saveAttempt(userId, simulationId, {
    answers: graded,
    score,
    topicScores,
    durationSeconds,
  })
  revalidatePath(`/session/${sessionId}/exam`)
  revalidatePath(`/session/${sessionId}/dashboard`)

  return {
    result: { score, earned, total, answers: graded, topicScores },
  }
}

export async function deleteSimulationAction(
  sessionId: string,
  simulationId: string,
): Promise<void> {
  const userId = await requireUserId()
  await deleteSimulation(userId, simulationId)
  revalidatePath(`/session/${sessionId}/exam`)
}
