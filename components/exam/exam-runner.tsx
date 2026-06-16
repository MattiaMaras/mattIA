"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Trophy,
} from "lucide-react"
import {
  submitExamAction,
  type ExamResult,
} from "@/app/(app)/session/[id]/exam-actions"
import type {
  ExamAnswer,
  ExamQuestion,
  ExamSimulation,
} from "@/lib/exams"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

export function ExamRunner({
  sessionId,
  simulation,
  onExit,
}: {
  sessionId: string
  simulation: ExamSimulation
  onExit: () => void
}) {
  const questions = (simulation.questions as unknown as ExamQuestion[]) ?? []
  const completed = simulation.status === "completed"

  const [answers, setAnswers] = React.useState<Map<string, ExamAnswer>>(() => {
    const m = new Map<string, ExamAnswer>()
    if (completed && Array.isArray(simulation.answers)) {
      for (const a of simulation.answers as unknown as ExamAnswer[]) {
        m.set(a.questionId, a)
      }
    }
    return m
  })
  const [result, setResult] = React.useState<ExamResult | null>(
    completed
      ? {
          score: simulation.score ?? 0,
          earned: 0,
          total: 0,
          answers: (simulation.answers as unknown as ExamAnswer[]) ?? [],
          topicScores:
            (simulation.topic_scores as unknown as Record<string, number>) ?? {},
        }
      : null,
  )
  const [submitting, setSubmitting] = React.useState(false)
  const startedAt = React.useRef(Date.now())
  const [elapsed, setElapsed] = React.useState(0)

  const reviewing = result != null

  React.useEffect(() => {
    if (reviewing) return
    const t = setInterval(
      () => setElapsed(Math.floor((Date.now() - startedAt.current) / 1000)),
      1000,
    )
    return () => clearInterval(t)
  }, [reviewing])

  function setMcq(qid: string, option: number) {
    if (reviewing) return
    setAnswers((m) => new Map(m).set(qid, { questionId: qid, selectedOption: option }))
  }
  function setOpen(qid: string, text: string) {
    if (reviewing) return
    setAnswers((m) => new Map(m).set(qid, { questionId: qid, text }))
  }

  async function submit() {
    setSubmitting(true)
    try {
      const payload = questions.map(
        (q) => answers.get(q.id) ?? { questionId: q.id },
      )
      const res = await submitExamAction(
        sessionId,
        simulation.id,
        payload,
        Math.floor((Date.now() - startedAt.current) / 1000),
      )
      if (res.error) toast.error(res.error)
      else if (res.result) {
        setResult(res.result)
        const m = new Map<string, ExamAnswer>()
        for (const a of res.result.answers) m.set(a.questionId, a)
        setAnswers(m)
        window.scrollTo({ top: 0, behavior: "smooth" })
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl py-6">
      <div className="mb-4 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onExit}>
          <ArrowLeft className="size-4" />
          Esami
        </Button>
        {!reviewing && (
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="size-4" />
            {formatTime(elapsed)}
          </span>
        )}
      </div>

      <h1 className="text-xl font-semibold tracking-tight">{simulation.title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {questions.length} domande ·{" "}
        {questions.reduce((s, q) => s + q.points, 0)} punti totali
      </p>

      {reviewing && result && <ResultSummary result={result} />}

      <div className="mt-6 space-y-4">
        {questions.map((q, i) => (
          <QuestionCard
            key={q.id}
            index={i}
            question={q}
            answer={answers.get(q.id)}
            reviewing={reviewing}
            onMcq={(opt) => setMcq(q.id, opt)}
            onOpen={(t) => setOpen(q.id, t)}
          />
        ))}
      </div>

      {!reviewing ? (
        <div className="mt-6 flex justify-end">
          <Button onClick={submit} disabled={submitting} size="lg">
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Correzione in corso…
              </>
            ) : (
              "Consegna e correggi"
            )}
          </Button>
        </div>
      ) : (
        <div className="mt-6 flex justify-end">
          <Button variant="outline" onClick={onExit}>
            Torna agli esami
          </Button>
        </div>
      )}
    </div>
  )
}

function ResultSummary({ result }: { result: ExamResult }) {
  const topics = Object.entries(result.topicScores)
  return (
    <Card className="mt-5 overflow-hidden p-0">
      <div className="flex items-center gap-4 bg-aurora p-5">
        <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-glow">
          <Trophy className="size-8" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Punteggio</p>
          <p className="text-3xl font-semibold">{result.score}/100</p>
        </div>
      </div>
      {topics.length > 0 && (
        <div className="space-y-2 p-5">
          <p className="text-sm font-medium">Padronanza per argomento</p>
          {topics.map(([topic, score]) => (
            <div key={topic}>
              <div className="mb-1 flex justify-between text-xs">
                <span>{topic}</span>
                <span className="text-muted-foreground">
                  {Math.round(score * 100)}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${Math.round(score * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

function QuestionCard({
  index,
  question,
  answer,
  reviewing,
  onMcq,
  onOpen,
}: {
  index: number
  question: ExamQuestion
  answer?: ExamAnswer
  reviewing: boolean
  onMcq: (opt: number) => void
  onOpen: (text: string) => void
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="grid size-6 shrink-0 place-items-center rounded-full bg-muted text-xs font-medium">
            {index + 1}
          </span>
          <Badge variant="secondary" className="text-[10px]">
            {question.topic}
          </Badge>
        </div>
        <span className="text-xs text-muted-foreground">
          {reviewing && answer?.awarded != null
            ? `${answer.awarded}/${question.points} pt`
            : `${question.points} pt`}
        </span>
      </div>

      <p className="mt-3 font-medium">{question.question}</p>

      {question.type === "mcq" && question.options ? (
        <div className="mt-3 space-y-2">
          {question.options.map((opt, oi) => {
            const selected = answer?.selectedOption === oi
            const isCorrect = reviewing && oi === question.correctOption
            const isWrongPick = reviewing && selected && oi !== question.correctOption
            return (
              <button
                key={oi}
                type="button"
                disabled={reviewing}
                onClick={() => onMcq(oi)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                  isCorrect && "border-emerald-500/50 bg-emerald-500/10",
                  isWrongPick && "border-destructive/50 bg-destructive/10",
                  !reviewing && selected && "border-primary bg-primary/10",
                  !reviewing && !selected && "border-border hover:bg-muted",
                  reviewing && !isCorrect && !isWrongPick && "border-border",
                )}
              >
                <span
                  className={cn(
                    "grid size-5 shrink-0 place-items-center rounded-full border text-xs",
                    selected && !reviewing && "border-primary bg-primary text-primary-foreground",
                  )}
                >
                  {String.fromCharCode(65 + oi)}
                </span>
                <span className="flex-1">{opt}</span>
                {isCorrect && <CheckCircle2 className="size-4 text-emerald-500" />}
                {isWrongPick && <XCircle className="size-4 text-destructive" />}
              </button>
            )
          })}
        </div>
      ) : (
        <div className="mt-3">
          <Textarea
            value={answer?.text ?? ""}
            onChange={(e) => onOpen(e.target.value)}
            disabled={reviewing}
            rows={4}
            placeholder="Scrivi la tua risposta…"
          />
        </div>
      )}

      {reviewing && question.type === "open" && (
        <div className="mt-3 space-y-2 text-sm">
          {answer?.feedback && (
            <div className="rounded-lg border border-border/60 bg-muted/40 p-3">
              <p className="text-xs font-medium text-muted-foreground">Feedback</p>
              <p className="mt-0.5">{answer.feedback}</p>
            </div>
          )}
          {question.sampleAnswer && (
            <details className="rounded-lg border border-border/60 p-3">
              <summary className="cursor-pointer text-xs font-medium text-muted-foreground">
                Risposta di riferimento
              </summary>
              <p className="mt-2">{question.sampleAnswer}</p>
            </details>
          )}
        </div>
      )}
    </Card>
  )
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
}
