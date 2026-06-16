"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Plus, MessageSquare, Trash2, Loader2 } from "lucide-react"
import {
  createThreadAction,
  deleteThreadAction,
} from "@/app/(app)/session/[id]/actions"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface ThreadListItem {
  id: string
  title: string | null
}

export function ThreadSidebar({
  sessionId,
  threads,
  activeThreadId,
}: {
  sessionId: string
  threads: ThreadListItem[]
  activeThreadId: string
}) {
  const router = useRouter()
  const [pending, startTransition] = React.useTransition()

  function open(threadId: string) {
    router.push(`/session/${sessionId}?thread=${threadId}`)
  }

  function newChat() {
    startTransition(async () => {
      const res = await createThreadAction(sessionId)
      if (res.threadId) {
        router.push(`/session/${sessionId}?thread=${res.threadId}`)
        router.refresh()
      }
    })
  }

  function remove(threadId: string) {
    startTransition(async () => {
      await deleteThreadAction(sessionId, threadId)
      if (threadId === activeThreadId) {
        router.push(`/session/${sessionId}`)
      }
      router.refresh()
    })
  }

  return (
    <div className="flex h-full flex-col gap-2 p-2">
      <Button
        onClick={newChat}
        disabled={pending}
        className="w-full justify-start"
        variant="outline"
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Plus className="size-4" />
        )}
        Nuova chat
      </Button>

      <div className="flex-1 space-y-0.5 overflow-y-auto">
        {threads.length === 0 ? (
          <p className="px-2 py-4 text-center text-xs text-muted-foreground">
            Nessuna conversazione
          </p>
        ) : (
          threads.map((t) => {
            const active = t.id === activeThreadId
            return (
              <div
                key={t.id}
                className={cn(
                  "group flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
              >
                <button
                  type="button"
                  onClick={() => open(t.id)}
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                >
                  <MessageSquare className="size-4 shrink-0" />
                  <span className="truncate">{t.title || "Conversazione"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => remove(t.id)}
                  disabled={pending}
                  aria-label="Elimina conversazione"
                  className="shrink-0 rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
