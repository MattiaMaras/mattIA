import "server-only"
import { supabaseAdmin } from "@/lib/supabase/admin"
import type { Json, Tables } from "@/lib/database.types"

export type ExamSimulation = Tables<"exam_simulations">

export interface ExamQuestion {
  id: string
  type: "mcq" | "open"
  topic: string
  question: string
  options?: string[]
  correctOption?: number
  sampleAnswer?: string
  points: number
}

export interface ExamAnswer {
  questionId: string
  selectedOption?: number | null
  text?: string
  awarded?: number
  feedback?: string
}

export async function listSimulations(
  clerkUserId: string,
  sessionId: string,
): Promise<ExamSimulation[]> {
  const { data, error } = await supabaseAdmin()
    .from("exam_simulations")
    .select("*")
    .eq("clerk_user_id", clerkUserId)
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getSimulation(
  clerkUserId: string,
  simulationId: string,
): Promise<ExamSimulation | null> {
  const { data, error } = await supabaseAdmin()
    .from("exam_simulations")
    .select("*")
    .eq("id", simulationId)
    .eq("clerk_user_id", clerkUserId)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function createSimulation(
  clerkUserId: string,
  sessionId: string,
  input: {
    title: string
    questions: ExamQuestion[]
    timeLimitSeconds?: number | null
  },
): Promise<ExamSimulation> {
  const { data, error } = await supabaseAdmin()
    .from("exam_simulations")
    .insert({
      clerk_user_id: clerkUserId,
      session_id: sessionId,
      title: input.title,
      status: "generated",
      questions: input.questions as unknown as Json,
      time_limit_seconds: input.timeLimitSeconds ?? null,
    })
    .select("*")
    .single()
  if (error) throw error
  return data
}

export async function saveAttempt(
  clerkUserId: string,
  simulationId: string,
  input: {
    answers: ExamAnswer[]
    score: number
    topicScores: Record<string, number>
    durationSeconds: number
  },
): Promise<void> {
  const { error } = await supabaseAdmin()
    .from("exam_simulations")
    .update({
      status: "completed",
      answers: input.answers as unknown as Json,
      score: input.score,
      topic_scores: input.topicScores as unknown as Json,
      duration_seconds: input.durationSeconds,
      completed_at: new Date().toISOString(),
    })
    .eq("id", simulationId)
    .eq("clerk_user_id", clerkUserId)
  if (error) throw error
}

export async function deleteSimulation(
  clerkUserId: string,
  simulationId: string,
): Promise<void> {
  const { error } = await supabaseAdmin()
    .from("exam_simulations")
    .delete()
    .eq("id", simulationId)
    .eq("clerk_user_id", clerkUserId)
  if (error) throw error
}
