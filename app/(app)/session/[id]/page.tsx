import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, GraduationCap, LayoutDashboard, Layers } from "lucide-react"
import { requireUserId } from "@/lib/auth"
import { getSession } from "@/lib/sessions"
import { getProfile } from "@/lib/profile"
import {
  createThread,
  getThread,
  getThreadMessages,
  listThreads,
} from "@/lib/chat"
import { getConfiguredProviders } from "@/lib/ai/keys"
import { listDocuments } from "@/lib/documents"
import { listNotebooks } from "@/lib/notebooks"
import { getOrCreateWhiteboard } from "@/lib/whiteboards"
import { listGlossary } from "@/lib/glossary"
import {
  DEFAULT_MODEL,
  DEFAULT_PROVIDER,
  EMBEDDING_PROVIDERS,
  isProviderId,
  type ProviderId,
} from "@/lib/ai/models"
import { sessionColor, sessionIcon } from "@/lib/session-theme"
import { AppTopbar } from "@/components/app/app-topbar"
import { ThreadSidebar } from "@/components/chat/thread-sidebar"
import { MaterialsSheet } from "@/components/materials/materials-sheet"
import { SessionWorkspace } from "@/components/session/session-workspace"
import { StudyTimer } from "@/components/timer/study-timer"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type RouteProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ thread?: string }>
}

export async function generateMetadata(props: RouteProps) {
  const { id } = await props.params
  const userId = await requireUserId()
  const session = await getSession(userId, id)
  return { title: session?.title ?? "Sessione" }
}

function pickProvider(...c: (string | null | undefined)[]): ProviderId {
  for (const x of c) if (x && isProviderId(x)) return x
  return DEFAULT_PROVIDER
}

export default async function SessionPage(props: RouteProps) {
  const { id } = await props.params
  const { thread: threadParam } = await props.searchParams
  const userId = await requireUserId()

  const [session, profile, threads, configured, documents] = await Promise.all([
    getSession(userId, id),
    getProfile(userId),
    listThreads(userId, id),
    getConfiguredProviders(userId),
    listDocuments(userId, id),
  ])
  if (!session) notFound()

  const hasEmbeddingProvider = configured.some((p) =>
    EMBEDDING_PROVIDERS.includes(p),
  )

  const [notebooks, whiteboard, glossary] = await Promise.all([
    listNotebooks(userId, id),
    getOrCreateWhiteboard(userId, id),
    listGlossary(userId, id),
  ])

  // Resolve the active thread, creating the first one on demand.
  let activeThread = threadParam
    ? await getThread(userId, threadParam)
    : null
  if (!activeThread) {
    if (threads.length > 0) {
      activeThread = threads[0]
    } else {
      const created = await createThread(userId, id, {
        modelProvider: session.default_provider,
        modelId: session.default_model,
      })
      redirect(`/session/${id}?thread=${created.id}`)
    }
  }

  const messages = await getThreadMessages(userId, activeThread.id)

  const initialModel = {
    provider: pickProvider(
      activeThread.model_provider,
      session.default_provider,
      profile?.default_provider,
    ),
    modelId:
      activeThread.model_id ||
      session.default_model ||
      profile?.default_model ||
      DEFAULT_MODEL,
  }

  const color = sessionColor(session.color)
  const Icon = sessionIcon(session.icon)

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <AppTopbar>
        <div className="flex w-full items-center gap-2.5">
          <Button
            variant="ghost"
            size="icon-sm"
            render={<Link href="/dashboard" />}
            aria-label="Torna alle sessioni"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div
            className={cn(
              "grid size-7 place-items-center rounded-lg",
              color.soft,
              color.icon,
            )}
          >
            <Icon className="size-4" />
          </div>
          <span className="truncate text-sm font-medium">{session.title}</span>
          <div className="ml-auto flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              render={<Link href={`/session/${id}/dashboard`} />}
            >
              <LayoutDashboard className="size-4" />
              <span className="hidden lg:inline">Dashboard</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              render={<Link href={`/session/${id}/flashcards`} />}
            >
              <Layers className="size-4" />
              <span className="hidden lg:inline">Flashcard</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              render={<Link href={`/session/${id}/exam`} />}
            >
              <GraduationCap className="size-4" />
              <span className="hidden sm:inline">Esami</span>
            </Button>
            <MaterialsSheet
              sessionId={id}
              initialDocuments={documents}
              hasEmbeddingProvider={hasEmbeddingProvider}
            />
          </div>
        </div>
      </AppTopbar>

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-60 shrink-0 border-r border-border/60 md:block">
          <ThreadSidebar
            sessionId={id}
            threads={threads.map((t) => ({ id: t.id, title: t.title }))}
            activeThreadId={activeThread.id}
          />
        </aside>

        <main className="min-w-0 flex-1">
          <SessionWorkspace
            key={activeThread.id}
            sessionId={id}
            threadId={activeThread.id}
            initialMessages={messages}
            initialModel={initialModel}
            configuredProviders={configured}
            notebooks={notebooks}
            whiteboardId={whiteboard.id}
            whiteboardSnapshot={whiteboard.snapshot}
            glossary={glossary}
          />
        </main>
      </div>

      <StudyTimer />
    </div>
  )
}
