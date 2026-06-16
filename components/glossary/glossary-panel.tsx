"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { BookMarked, Loader2, Sparkles, Trash2, Search } from "lucide-react"
import {
  generateGlossaryAction,
  deleteTermAction,
} from "@/app/(app)/session/[id]/glossary-actions"
import type { GlossaryTerm } from "@/lib/glossary"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function GlossaryPanel({
  sessionId,
  initialTerms,
}: {
  sessionId: string
  initialTerms: GlossaryTerm[]
}) {
  const router = useRouter()
  const [terms, setTerms] = React.useState(initialTerms)
  const [generating, setGenerating] = React.useState(false)
  const [query, setQuery] = React.useState("")

  React.useEffect(() => setTerms(initialTerms), [initialTerms])

  async function generate() {
    setGenerating(true)
    try {
      const res = await generateGlossaryAction(sessionId)
      if (res.error) toast.error(res.error)
      else if (res.terms) {
        setTerms(res.terms)
        toast.success(`${res.terms.length} termini nel glossario`)
        router.refresh()
      }
    } finally {
      setGenerating(false)
    }
  }

  async function remove(id: string) {
    setTerms((t) => t.filter((x) => x.id !== id))
    await deleteTermAction(sessionId, id)
    router.refresh()
  }

  const filtered = query
    ? terms.filter(
        (t) =>
          t.term.toLowerCase().includes(query.toLowerCase()) ||
          t.definition.toLowerCase().includes(query.toLowerCase()),
      )
    : terms

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border/60 px-2 py-1.5">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cerca un termine…"
            className="h-8 pl-8 text-sm"
          />
        </div>
        <Button size="sm" onClick={generate} disabled={generating}>
          {generating ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Sparkles className="size-4" />
          )}
          <span className="hidden sm:inline">Genera</span>
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {terms.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <div className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
              <BookMarked className="size-6" />
            </div>
            <div>
              <p className="font-medium">Glossario vuoto</p>
              <p className="text-sm text-muted-foreground">
                Genera un glossario dei concetti chiave dai tuoi materiali. I
                termini compariranno con definizione al passaggio del mouse nella
                chat.
              </p>
            </div>
            <Button onClick={generate} disabled={generating}>
              {generating ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Generazione…
                </>
              ) : (
                <>
                  <Sparkles className="size-4" /> Genera glossario
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((t) => (
              <div
                key={t.id}
                className="group rounded-xl border border-border/60 bg-card p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-semibold text-primary">{t.term}</h4>
                  <button
                    type="button"
                    onClick={() => remove(t.id)}
                    aria-label="Elimina termine"
                    className="shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t.definition}
                </p>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Nessun termine corrisponde.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
