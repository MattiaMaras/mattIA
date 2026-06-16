import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { requireUserId } from "@/lib/auth"
import { getSession } from "@/lib/sessions"
import { listSimulations } from "@/lib/exams"
import { getConfiguredProviders } from "@/lib/ai/keys"
import { AppTopbar } from "@/components/app/app-topbar"
import { ExamCenter } from "@/components/exam/exam-center"
import { Button } from "@/components/ui/button"

type RouteProps = { params: Promise<{ id: string }> }

export async function generateMetadata(props: RouteProps) {
  const { id } = await props.params
  const userId = await requireUserId()
  const session = await getSession(userId, id)
  return { title: session ? `Esami · ${session.title}` : "Esami" }
}

export default async function ExamPage(props: RouteProps) {
  const { id } = await props.params
  const userId = await requireUserId()

  const [session, simulations, configured] = await Promise.all([
    getSession(userId, id),
    listSimulations(userId, id),
    getConfiguredProviders(userId),
  ])
  if (!session) notFound()

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
            Esami · {session.title}
          </span>
        </div>
      </AppTopbar>
      <main className="mx-auto w-[min(1100px,94%)] flex-1">
        <ExamCenter
          sessionId={id}
          initialSimulations={simulations}
          aiConfigured={configured.length > 0}
        />
      </main>
    </div>
  )
}
