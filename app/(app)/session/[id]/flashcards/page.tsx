import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { requireUserId } from "@/lib/auth"
import { getSession } from "@/lib/sessions"
import { listFlashcards } from "@/lib/flashcards"
import { getConfiguredProviders } from "@/lib/ai/keys"
import { AppTopbar } from "@/components/app/app-topbar"
import { FlashcardsCenter } from "@/components/flashcards/flashcards-center"
import { Button } from "@/components/ui/button"

type RouteProps = { params: Promise<{ id: string }> }

export async function generateMetadata(props: RouteProps) {
  const { id } = await props.params
  const userId = await requireUserId()
  const session = await getSession(userId, id)
  return { title: session ? `Flashcard · ${session.title}` : "Flashcard" }
}

export default async function FlashcardsPage(props: RouteProps) {
  const { id } = await props.params
  const userId = await requireUserId()

  const [session, cards, configured] = await Promise.all([
    getSession(userId, id),
    listFlashcards(userId, id),
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
            Flashcard · {session.title}
          </span>
        </div>
      </AppTopbar>
      <main className="mx-auto w-[min(1100px,94%)] flex-1">
        <FlashcardsCenter
          sessionId={id}
          initialCards={cards}
          aiConfigured={configured.length > 0}
        />
      </main>
    </div>
  )
}
