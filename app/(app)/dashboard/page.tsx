import { Sparkles } from "lucide-react"
import { requireUserId } from "@/lib/auth"
import { getOrCreateProfile } from "@/lib/profile"
import { listSessions } from "@/lib/sessions"
import { getConfiguredProviders } from "@/lib/ai/keys"
import { AppTopbar } from "@/components/app/app-topbar"
import { SessionCard } from "@/components/sessions/session-card"
import { CreateSessionDialog } from "@/components/sessions/create-session-dialog"
import { ApiKeyBanner } from "@/components/app/api-key-banner"

export const metadata = { title: "Dashboard" }

export default async function DashboardPage() {
  const userId = await requireUserId()
  const [profile, sessions, providers] = await Promise.all([
    getOrCreateProfile(),
    listSessions(userId),
    getConfiguredProviders(userId),
  ])
  const firstName = profile.full_name?.split(" ")[0] ?? "studente"

  return (
    <div className="flex min-h-dvh flex-col">
      <AppTopbar />
      <main className="mx-auto w-[min(1100px,94%)] flex-1 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Ciao {firstName} 👋
            </h1>
            <p className="mt-1 text-muted-foreground">
              {sessions.length > 0
                ? "Riprendi da dove avevi lasciato o crea una nuova sessione."
                : "Crea la tua prima sessione di studio per iniziare."}
            </p>
          </div>
          {sessions.length > 0 && <CreateSessionDialog />}
        </div>

        {providers.length === 0 && <ApiKeyBanner className="mt-6" />}

        {sessions.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sessions.map((s, i) => (
              <SessionCard key={s.id} session={s} index={i} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="relative mt-10 overflow-hidden rounded-3xl border border-dashed border-border/70 bg-card/40 px-6 py-16 text-center">
      <div className="pointer-events-none absolute inset-0 bg-aurora opacity-60" />
      <div className="relative mx-auto max-w-md">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Sparkles className="size-7" />
        </div>
        <h2 className="mt-5 text-lg font-medium">Nessuna sessione ancora</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Una sessione raccoglie i materiali di una materia e tutto ciò che ci
          costruisci sopra: chat, simulazioni, appunti e flashcard.
        </p>
        <div className="mt-6 flex justify-center">
          <CreateSessionDialog triggerLabel="Crea la prima sessione" />
        </div>
      </div>
    </div>
  )
}
