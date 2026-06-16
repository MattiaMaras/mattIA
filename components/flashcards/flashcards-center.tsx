"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import {
  Sparkles,
  Loader2,
  Layers,
  Trash2,
  RotateCcw,
  GraduationCap,
  CheckCircle2,
} from "lucide-react"
import {
  generateFlashcardsAction,
  reviewFlashcardAction,
  deleteFlashcardAction,
} from "@/app/(app)/session/[id]/flashcard-actions"
import type { Flashcard } from "@/lib/flashcards"
import type { ReviewGrade } from "@/lib/srs"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

export function FlashcardsCenter({
  sessionId,
  initialCards,
  aiConfigured,
}: {
  sessionId: string
  initialCards: Flashcard[]
  aiConfigured: boolean
}) {
  const router = useRouter()
  const [cards, setCards] = React.useState(initialCards)
  const [count, setCount] = React.useState("10")
  const [generating, setGenerating] = React.useState(false)
  const [studying, setStudying] = React.useState(false)

  React.useEffect(() => setCards(initialCards), [initialCards])

  const due = cards.filter((c) => new Date(c.due_at) <= new Date())

  async function generate() {
    if (!aiConfigured) {
      toast.error("Configura una chiave AI nelle Impostazioni.")
      return
    }
    setGenerating(true)
    try {
      const res = await generateFlashcardsAction(sessionId, Number(count))
      if (res.error) toast.error(res.error)
      else if (res.cards) {
        setCards(res.cards)
        toast.success(`${res.created} flashcard create`)
        router.refresh()
      }
    } finally {
      setGenerating(false)
    }
  }

  async function remove(id: string) {
    setCards((c) => c.filter((x) => x.id !== id))
    await deleteFlashcardAction(sessionId, id)
    router.refresh()
  }

  if (studying) {
    return (
      <StudySession
        cards={due}
        onExit={() => {
          setStudying(false)
          router.refresh()
        }}
      />
    )
  }

  return (
    <div className="mx-auto w-full max-w-2xl py-8">
      {/* Stats + study CTA */}
      <Card className="overflow-hidden p-0">
        <div className="flex flex-wrap items-center gap-4 bg-aurora p-5">
          <div className="grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-glow">
            <Layers className="size-6" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Flashcard</p>
            <p className="text-2xl font-semibold">
              {due.length} da ripassare{" "}
              <span className="text-base font-normal text-muted-foreground">
                · {cards.length} totali
              </span>
            </p>
          </div>
          <Button
            size="lg"
            disabled={due.length === 0}
            onClick={() => setStudying(true)}
            className="shadow-glow"
          >
            <GraduationCap className="size-4" />
            Inizia ripasso
          </Button>
        </div>
        <div className="flex flex-wrap items-end gap-3 p-5">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Quante
            </label>
            <Select value={count} onValueChange={(v) => v && setCount(v)}>
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["6", "10", "15", "20"].map((n) => (
                  <SelectItem key={n} value={n}>
                    {n} carte
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={generate} disabled={generating} variant="outline" className="ml-auto">
            {generating ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Generazione…
              </>
            ) : (
              <>
                <Sparkles className="size-4" />
                Genera dagli appunti
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* All cards */}
      <h3 className="mb-3 mt-8 text-sm font-medium text-muted-foreground">
        Tutte le flashcard
      </h3>
      {cards.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/70 bg-card/40 p-10 text-center text-sm text-muted-foreground">
          Nessuna flashcard. Generale dai tuoi appunti qui sopra.
        </div>
      ) : (
        <div className="space-y-2">
          {cards.map((c) => (
            <Card key={c.id} className="flex items-start gap-3 p-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium">{c.front}</p>
                  {c.topic && (
                    <Badge variant="secondary" className="shrink-0 text-[10px]">
                      {c.topic}
                    </Badge>
                  )}
                </div>
                <p className="mt-0.5 truncate text-sm text-muted-foreground">
                  {c.back}
                </p>
              </div>
              <button
                type="button"
                onClick={() => remove(c.id)}
                aria-label="Elimina"
                className="shrink-0 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function StudySession({
  cards,
  onExit,
}: {
  cards: Flashcard[]
  onExit: () => void
}) {
  const [index, setIndex] = React.useState(0)
  const [flipped, setFlipped] = React.useState(false)
  const card = cards[index]

  async function grade(g: ReviewGrade) {
    if (!card) return
    await reviewFlashcardAction(
      card.id,
      {
        easeFactor: card.ease_factor,
        intervalDays: card.interval_days,
        repetitions: card.repetitions,
      },
      g,
    )
    if (index + 1 >= cards.length) {
      onExit()
    } else {
      setFlipped(false)
      setIndex((i) => i + 1)
    }
  }

  if (!card) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col items-center py-20 text-center">
        <CheckCircle2 className="size-12 text-emerald-500" />
        <p className="mt-4 text-lg font-medium">Ripasso completato!</p>
        <Button className="mt-6" onClick={onExit}>
          Torna alle flashcard
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-xl py-8">
      <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
        <button onClick={onExit} className="hover:text-foreground">
          Esci
        </button>
        <span>
          {index + 1} / {cards.length}
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${(index / cards.length) * 100}%` }}
        />
      </div>

      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        className="mt-6 w-full"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={flipped ? "back" : "front"}
            initial={{ rotateX: 90, opacity: 0 }}
            animate={{ rotateX: 0, opacity: 1 }}
            exit={{ rotateX: -90, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "grid min-h-[220px] place-items-center rounded-2xl border p-8 text-center",
              flipped
                ? "border-primary/30 bg-primary/5"
                : "border-border/60 bg-card",
            )}
          >
            <div>
              <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
                {flipped ? "Risposta" : "Domanda"}
              </p>
              <p className="text-lg font-medium">
                {flipped ? card.back : card.front}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </button>

      {!flipped ? (
        <Button className="mt-6 w-full" size="lg" onClick={() => setFlipped(true)}>
          <RotateCcw className="size-4" />
          Mostra risposta
        </Button>
      ) : (
        <div className="mt-6 grid grid-cols-4 gap-2">
          <GradeBtn label="Di nuovo" sub="<1m" tone="destructive" onClick={() => grade("again")} />
          <GradeBtn label="Difficile" sub="" tone="amber" onClick={() => grade("hard")} />
          <GradeBtn label="Buono" sub="" tone="primary" onClick={() => grade("good")} />
          <GradeBtn label="Facile" sub="" tone="emerald" onClick={() => grade("easy")} />
        </div>
      )}
    </div>
  )
}

function GradeBtn({
  label,
  sub,
  tone,
  onClick,
}: {
  label: string
  sub: string
  tone: "destructive" | "amber" | "primary" | "emerald"
  onClick: () => void
}) {
  const tones: Record<string, string> = {
    destructive: "border-destructive/40 hover:bg-destructive/10 text-destructive",
    amber: "border-amber-500/40 hover:bg-amber-500/10 text-amber-600 dark:text-amber-500",
    primary: "border-primary/40 hover:bg-primary/10 text-primary",
    emerald: "border-emerald-500/40 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500",
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-center rounded-xl border bg-card py-3 text-sm font-medium transition-colors",
        tones[tone],
      )}
    >
      {label}
      {sub && <span className="text-[10px] opacity-70">{sub}</span>}
    </button>
  )
}
