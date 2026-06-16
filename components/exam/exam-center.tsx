"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  FileQuestion,
  Loader2,
  Play,
  Eye,
  Trash2,
  Sparkles,
} from "lucide-react"
import {
  generateExamAction,
  deleteSimulationAction,
} from "@/app/(app)/session/[id]/exam-actions"
import type { ExamSimulation } from "@/lib/exams"
import { ExamRunner } from "@/components/exam/exam-runner"
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

type Difficulty = "facile" | "medio" | "difficile"

export function ExamCenter({
  sessionId,
  initialSimulations,
  aiConfigured,
}: {
  sessionId: string
  initialSimulations: ExamSimulation[]
  aiConfigured: boolean
}) {
  const router = useRouter()
  const [sims, setSims] = React.useState(initialSimulations)
  const [active, setActive] = React.useState<ExamSimulation | null>(null)
  const [num, setNum] = React.useState("6")
  const [difficulty, setDifficulty] = React.useState<Difficulty>("medio")
  const [generating, setGenerating] = React.useState(false)

  React.useEffect(() => setSims(initialSimulations), [initialSimulations])

  async function generate() {
    if (!aiConfigured) {
      toast.error("Configura una chiave AI nelle Impostazioni.")
      return
    }
    setGenerating(true)
    try {
      const res = await generateExamAction(sessionId, {
        numQuestions: Number(num),
        difficulty,
      })
      if (res.error) toast.error(res.error)
      else if (res.simulation) {
        setSims((s) => [res.simulation!, ...s])
        setActive(res.simulation)
      }
    } finally {
      setGenerating(false)
    }
  }

  async function remove(id: string) {
    setSims((s) => s.filter((x) => x.id !== id))
    await deleteSimulationAction(sessionId, id)
    router.refresh()
  }

  if (active) {
    return (
      <ExamRunner
        sessionId={sessionId}
        simulation={active}
        onExit={() => {
          setActive(null)
          router.refresh()
        }}
      />
    )
  }

  return (
    <div className="mx-auto w-full max-w-2xl py-8">
      {/* Generator */}
      <Card className="overflow-hidden p-0">
        <div className="flex items-center gap-3 border-b border-border/60 bg-aurora p-5">
          <div className="grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground shadow-glow">
            <Sparkles className="size-5" />
          </div>
          <div>
            <h2 className="font-semibold">Genera una simulazione</h2>
            <p className="text-sm text-muted-foreground">
              Domande create dall&apos;AI sui tuoi materiali e tracce d&apos;esame.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-3 p-5">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Domande
            </label>
            <Select value={num} onValueChange={(v) => v && setNum(v)}>
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["4", "6", "8", "10", "12"].map((n) => (
                  <SelectItem key={n} value={n}>
                    {n} domande
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Difficoltà
            </label>
            <Select
              value={difficulty}
              onValueChange={(v) => v && setDifficulty(v as Difficulty)}
            >
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="facile">Facile</SelectItem>
                <SelectItem value="medio">Medio</SelectItem>
                <SelectItem value="difficile">Difficile</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={generate} disabled={generating} className="ml-auto">
            {generating ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Generazione…
              </>
            ) : (
              <>
                <Sparkles className="size-4" />
                Genera esame
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* History */}
      <h3 className="mb-3 mt-8 text-sm font-medium text-muted-foreground">
        Simulazioni
      </h3>
      {sims.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/70 bg-card/40 p-10 text-center text-sm text-muted-foreground">
          Nessuna simulazione ancora. Generane una qui sopra.
        </div>
      ) : (
        <div className="space-y-2">
          {sims.map((sim) => {
            const done = sim.status === "completed"
            return (
              <Card key={sim.id} className="flex items-center gap-3 p-3">
                <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
                  <FileQuestion className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{sim.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(sim.created_at).toLocaleDateString("it-IT", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                {done ? (
                  <Badge
                    variant="secondary"
                    className="shrink-0 tabular-nums"
                  >
                    {sim.score ?? 0}/100
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="shrink-0">
                    da svolgere
                  </Badge>
                )}
                <Button
                  size="sm"
                  variant={done ? "outline" : "default"}
                  onClick={() => setActive(sim)}
                >
                  {done ? (
                    <>
                      <Eye className="size-4" /> Rivedi
                    </>
                  ) : (
                    <>
                      <Play className="size-4" /> Svolgi
                    </>
                  )}
                </Button>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => remove(sim.id)}
                  aria-label="Elimina"
                >
                  <Trash2 className="size-4" />
                </Button>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
