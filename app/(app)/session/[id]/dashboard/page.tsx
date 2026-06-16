import { notFound } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  GraduationCap,
  Target,
  Layers,
  FileStack,
} from "lucide-react"
import { requireUserId } from "@/lib/auth"
import { getSession } from "@/lib/sessions"
import { listSimulations, type ExamSimulation } from "@/lib/exams"
import { listFlashcards } from "@/lib/flashcards"
import { listDocuments } from "@/lib/documents"
import { AppTopbar } from "@/components/app/app-topbar"
import { MasteryRadar, type MasteryDatum } from "@/components/dashboard/mastery-radar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

type RouteProps = { params: Promise<{ id: string }> }

export async function generateMetadata(props: RouteProps) {
  const { id } = await props.params
  const userId = await requireUserId()
  const session = await getSession(userId, id)
  return { title: session ? `Dashboard · ${session.title}` : "Dashboard" }
}

function aggregateMastery(sims: ExamSimulation[]): MasteryDatum[] {
  const agg = new Map<string, { sum: number; n: number }>()
  for (const sim of sims) {
    const scores = (sim.topic_scores ?? {}) as Record<string, number>
    for (const [topic, score] of Object.entries(scores)) {
      const a = agg.get(topic) ?? { sum: 0, n: 0 }
      a.sum += score
      a.n += 1
      agg.set(topic, a)
    }
  }
  return [...agg.entries()]
    .map(([topic, a]) => ({ topic, mastery: (a.sum / a.n) * 100 }))
    .sort((x, y) => y.mastery - x.mastery)
    .slice(0, 8)
}

export default async function SessionDashboardPage(props: RouteProps) {
  const { id } = await props.params
  const userId = await requireUserId()

  const [session, sims, cards, documents] = await Promise.all([
    getSession(userId, id),
    listSimulations(userId, id),
    listFlashcards(userId, id),
    listDocuments(userId, id),
  ])
  if (!session) notFound()

  const completed = sims.filter((s) => s.status === "completed")
  const examsTaken = completed.length
  const avgScore =
    examsTaken > 0
      ? Math.round(
          completed.reduce((s, e) => s + (e.score ?? 0), 0) / examsTaken,
        )
      : null
  const dueCards = cards.filter((c) => new Date(c.due_at) <= new Date()).length
  const readyDocs = documents.filter((d) => d.status === "ready").length
  const mastery = aggregateMastery(completed)

  return (
    <div className="flex min-h-dvh flex-col">
      <AppTopbar>
        <div className="flex items-center gap-2.5">
          <Button
            variant="ghost"
            size="icon-sm"
            render={<Link href={`/session/${id}`} />}
            aria-label="Torna alla sessione"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <span className="truncate text-sm font-medium">
            Dashboard · {session.title}
          </span>
        </div>
      </AppTopbar>

      <main className="mx-auto w-[min(1000px,94%)] flex-1 py-8">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat
            icon={<GraduationCap className="size-5" />}
            label="Esami svolti"
            value={String(examsTaken)}
          />
          <Stat
            icon={<Target className="size-5" />}
            label="Media voti"
            value={avgScore != null ? `${avgScore}/100` : "—"}
          />
          <Stat
            icon={<Layers className="size-5" />}
            label="Carte da ripassare"
            value={String(dueCards)}
          />
          <Stat
            icon={<FileStack className="size-5" />}
            label="Materiali pronti"
            value={String(readyDocs)}
          />
        </div>

        <Card className="mt-6 p-5">
          <h2 className="font-medium">Padronanza per argomento</h2>
          <p className="text-sm text-muted-foreground">
            Calcolata dalle tue simulazioni d&apos;esame.
          </p>
          {mastery.length >= 3 ? (
            <MasteryRadar data={mastery} />
          ) : (
            <div className="mt-6 rounded-xl border border-dashed border-border/70 bg-card/40 p-10 text-center text-sm text-muted-foreground">
              Svolgi qualche{" "}
              <Link
                href={`/session/${id}/exam`}
                className="font-medium text-primary underline underline-offset-2"
              >
                simulazione d&apos;esame
              </Link>{" "}
              per vedere il radar della padronanza (servono almeno 3 argomenti).
            </div>
          )}
        </Card>

        {completed.length > 0 && (
          <Card className="mt-6 p-5">
            <h2 className="font-medium">Ultime simulazioni</h2>
            <div className="mt-3 space-y-2">
              {completed.slice(0, 6).map((sim) => (
                <Link
                  key={sim.id}
                  href={`/session/${id}/exam`}
                  className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2 text-sm transition-colors hover:bg-muted/50"
                >
                  <span className="truncate">{sim.title}</span>
                  <span className="shrink-0 font-medium tabular-nums">
                    {sim.score ?? 0}/100
                  </span>
                </Link>
              ))}
            </div>
          </Card>
        )}
      </main>
    </div>
  )
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </Card>
  )
}
