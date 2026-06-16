import "server-only"
import { generateObject } from "ai"
import { z } from "zod"
import { getLanguageModel } from "@/lib/ai/providers"
import { resolveUserChatModel } from "@/lib/ai/keys"
import { retrieveContext } from "@/lib/ai/retrieval"
import { getSession } from "@/lib/sessions"
import type { ExamAnswer, ExamQuestion } from "@/lib/exams"

export class ExamError extends Error {}

const questionSchema = z.object({
  type: z.enum(["mcq", "open"]),
  topic: z.string().describe("Argomento breve, es. 'Limiti', 'Algebra di Boole'"),
  question: z.string(),
  options: z
    .array(z.string())
    .optional()
    .describe("4 opzioni per le domande a risposta multipla (mcq)"),
  correctOption: z
    .number()
    .int()
    .optional()
    .describe("indice (0-based) dell'opzione corretta, solo per mcq"),
  sampleAnswer: z
    .string()
    .optional()
    .describe("risposta di riferimento per le domande aperte"),
  points: z.number().int().min(1).max(10),
})

const examSchema = z.object({
  questions: z.array(questionSchema).min(1),
})

export async function generateExam(
  clerkUserId: string,
  sessionId: string,
  opts: { numQuestions?: number; difficulty?: "facile" | "medio" | "difficile" } = {},
): Promise<{ title: string; questions: ExamQuestion[] }> {
  const session = await getSession(clerkUserId, sessionId)
  if (!session) throw new ExamError("Sessione non trovata")

  const model = await resolveUserChatModel(clerkUserId)
  if (!model) {
    throw new ExamError(
      "Configura una chiave AI nelle Impostazioni per generare simulazioni.",
    )
  }

  const numQuestions = Math.min(Math.max(opts.numQuestions ?? 6, 3), 15)
  const difficulty = opts.difficulty ?? "medio"

  const context = await retrieveContext(
    clerkUserId,
    sessionId,
    `${session.title} domande d'esame argomenti principali tracce`,
    14,
  )

  const { object } = await generateObject({
    model: getLanguageModel(model.provider, model.modelId, model.apiKey),
    schema: examSchema,
    prompt: `Sei un professore universitario di Ingegneria Informatica. Crea una simulazione d'esame per la materia "${session.title}".

Genera esattamente ${numQuestions} domande di difficoltà ${difficulty}, in italiano, variando tra:
- domande a risposta multipla ("mcq") con 4 opzioni e una sola corretta (indica correctOption come indice 0-based);
- domande aperte ("open") con una risposta di riferimento (sampleAnswer).
Assegna a ciascuna domanda un "topic" coerente e un punteggio "points" (1-10) proporzionato alla difficoltà.
Copri argomenti diversi e realistici per l'esame.
${
  context
    ? `Basati PRINCIPALMENTE su questi materiali ed esami dello studente:\n\n${context}`
    : "Non sono disponibili materiali caricati: usa il programma tipico della materia."
}`,
  })

  const questions: ExamQuestion[] = object.questions.map((q) => ({
    id: crypto.randomUUID(),
    type: q.type,
    topic: q.topic.trim() || "Generale",
    question: q.question,
    options: q.type === "mcq" ? q.options : undefined,
    correctOption: q.type === "mcq" ? q.correctOption : undefined,
    sampleAnswer: q.type === "open" ? q.sampleAnswer : undefined,
    points: q.points,
  }))

  return { title: `Simulazione · ${session.title}`, questions }
}

/** Grade open-ended answers with the AI; returns a map questionId → {score, feedback}. */
export async function gradeOpenAnswers(
  clerkUserId: string,
  questions: ExamQuestion[],
  answers: ExamAnswer[],
): Promise<Record<string, { score: number; feedback: string }>> {
  const openQuestions = questions.filter((q) => q.type === "open")
  if (openQuestions.length === 0) return {}

  const model = await resolveUserChatModel(clerkUserId)
  if (!model) return {}

  const answerMap = new Map(answers.map((a) => [a.questionId, a]))
  const items = openQuestions.map((q) => ({
    questionId: q.id,
    question: q.question,
    sampleAnswer: q.sampleAnswer ?? "",
    studentAnswer: answerMap.get(q.id)?.text ?? "",
  }))

  const gradeSchema = z.object({
    grades: z.array(
      z.object({
        questionId: z.string(),
        score: z.number().min(0).max(1).describe("0=errata, 1=perfetta"),
        feedback: z.string().describe("Feedback breve in italiano (1-2 frasi)"),
      }),
    ),
  })

  try {
    const { object } = await generateObject({
      model: getLanguageModel(model.provider, model.modelId, model.apiKey),
      schema: gradeSchema,
      prompt: `Sei un professore che corregge un esame. Per ogni domanda, valuta la risposta dello studente rispetto alla risposta di riferimento, assegnando un punteggio da 0 a 1 e un feedback breve e costruttivo in italiano.\n\n${JSON.stringify(
        items,
        null,
        2,
      )}`,
    })
    const out: Record<string, { score: number; feedback: string }> = {}
    for (const g of object.grades) {
      out[g.questionId] = { score: g.score, feedback: g.feedback }
    }
    return out
  } catch {
    return {}
  }
}
