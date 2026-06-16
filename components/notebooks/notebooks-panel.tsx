"use client"

import * as React from "react"
import { toast } from "sonner"
import { Plus, NotebookPen, Trash2, ChevronDown } from "lucide-react"
import {
  createNotebookAction,
  deleteNotebookAction,
} from "@/app/(app)/session/[id]/notebook-actions"
import type { Notebook } from "@/lib/notebooks"
import { MarkdownEditor } from "@/components/notebooks/markdown-editor"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function NotebooksPanel({
  sessionId,
  initialNotebooks,
}: {
  sessionId: string
  initialNotebooks: Notebook[]
}) {
  const [notebooks, setNotebooks] = React.useState<Notebook[]>(initialNotebooks)
  const [activeId, setActiveId] = React.useState<string | null>(
    initialNotebooks[0]?.id ?? null,
  )
  const [busy, setBusy] = React.useState(false)

  const active = notebooks.find((n) => n.id === activeId) ?? null

  async function newNotebook() {
    setBusy(true)
    try {
      const nb = await createNotebookAction(sessionId)
      setNotebooks((list) => [nb, ...list])
      setActiveId(nb.id)
    } catch {
      toast.error("Creazione non riuscita")
    } finally {
      setBusy(false)
    }
  }

  async function removeActive() {
    if (!active) return
    const id = active.id
    setNotebooks((list) => list.filter((n) => n.id !== id))
    setActiveId((prev) => {
      if (prev !== id) return prev
      const remaining = notebooks.filter((n) => n.id !== id)
      return remaining[0]?.id ?? null
    })
    await deleteNotebookAction(sessionId, id)
  }

  const updateMeta = React.useCallback(
    (id: string, meta: { title: string }) => {
      setNotebooks((list) =>
        list.map((n) => (n.id === id ? { ...n, title: meta.title } : n)),
      )
    },
    [],
  )

  if (notebooks.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
          <NotebookPen className="size-6" />
        </div>
        <div>
          <p className="font-medium">Nessun taccuino</p>
          <p className="text-sm text-muted-foreground">
            Crea un taccuino per prendere appunti in Markdown con formule LaTeX.
          </p>
        </div>
        <Button onClick={newNotebook} disabled={busy}>
          <Plus className="size-4" />
          Nuovo taccuino
        </Button>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Notebook switcher bar */}
      <div className="flex items-center gap-1 border-b border-border/60 px-2 py-1.5">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="sm" className="max-w-[200px] gap-1">
                <NotebookPen className="size-4 shrink-0 text-muted-foreground" />
                <span className="truncate">{active?.title ?? "Taccuino"}</span>
                <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
              </Button>
            }
          />
          <DropdownMenuContent align="start" className="w-56">
            {notebooks.map((n) => (
              <DropdownMenuItem key={n.id} onClick={() => setActiveId(n.id)}>
                <NotebookPen className="size-4 text-muted-foreground" />
                <span className="truncate">{n.title}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="ml-auto flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={newNotebook}
            disabled={busy}
            title="Nuovo taccuino"
            aria-label="Nuovo taccuino"
          >
            <Plus className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={removeActive}
            title="Elimina taccuino"
            aria-label="Elimina taccuino"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1">
        {active && (
          <MarkdownEditor
            key={active.id}
            sessionId={sessionId}
            notebookId={active.id}
            initialTitle={active.title}
            initialContent={active.content}
            onMeta={updateMeta}
          />
        )}
      </div>
    </div>
  )
}
