"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import {
  BookMarked,
  Code2,
  NotebookPen,
  PanelRightClose,
  PanelRightOpen,
  Presentation,
  Loader2,
  X,
} from "lucide-react"
import type { UIMessage } from "ai"
import type { ProviderId } from "@/lib/ai/models"
import type { Notebook } from "@/lib/notebooks"
import type { GlossaryTerm } from "@/lib/glossary"
import type { Json } from "@/lib/database.types"
import { ChatPanel } from "@/components/chat/chat-panel"
import { NotebooksPanel } from "@/components/notebooks/notebooks-panel"
import { GlossaryPanel } from "@/components/glossary/glossary-panel"
import { MarkdownCheatsheet } from "@/components/notebooks/markdown-cheatsheet"
import { ModelSelection } from "@/components/chat/model-switcher"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const Whiteboard = dynamic(
  () => import("@/components/whiteboard/whiteboard"),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-full place-items-center text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
      </div>
    ),
  },
)

const CodeSandbox = dynamic(() => import("@/components/sandbox/code-sandbox"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full place-items-center text-muted-foreground">
      <Loader2 className="size-5 animate-spin" />
    </div>
  ),
})

type Tool = "notes" | "whiteboard" | "glossary" | "code"

export function SessionWorkspace({
  sessionId,
  threadId,
  initialMessages,
  initialModel,
  configuredProviders,
  notebooks,
  whiteboardId,
  whiteboardSnapshot,
  glossary,
}: {
  sessionId: string
  threadId: string
  initialMessages: UIMessage[]
  initialModel: ModelSelection
  configuredProviders: ProviderId[]
  notebooks: Notebook[]
  whiteboardId: string
  whiteboardSnapshot: Json | null
  glossary: GlossaryTerm[]
}) {
  const [open, setOpen] = React.useState(false)
  const [tool, setTool] = React.useState<Tool>("notes")

  const glossaryEntries = React.useMemo(
    () => glossary.map((t) => ({ term: t.term, definition: t.definition })),
    [glossary],
  )

  return (
    <div className="flex h-full min-h-0">
      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col",
          open && "hidden md:flex",
        )}
      >
        <ChatPanel
          key={threadId}
          sessionId={sessionId}
          threadId={threadId}
          initialMessages={initialMessages}
          initialModel={initialModel}
          configuredProviders={configuredProviders}
          glossary={glossaryEntries}
          headerActions={
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setOpen((o) => !o)}
              title={open ? "Chiudi pannello" : "Apri appunti e lavagna"}
              aria-label={open ? "Chiudi pannello" : "Apri appunti e lavagna"}
            >
              {open ? (
                <PanelRightClose className="size-4" />
              ) : (
                <PanelRightOpen className="size-4" />
              )}
            </Button>
          }
        />
      </div>

      {open && (
        <div className="flex w-full flex-col border-l border-border/60 md:w-1/2">
          {/* Tools header */}
          <div className="flex items-center gap-1 border-b border-border/60 px-2 py-1.5">
            <div className="flex items-center rounded-lg bg-muted p-0.5 text-sm">
              <TabBtn
                active={tool === "notes"}
                onClick={() => setTool("notes")}
                icon={<NotebookPen className="size-3.5" />}
                label="Appunti"
              />
              <TabBtn
                active={tool === "whiteboard"}
                onClick={() => setTool("whiteboard")}
                icon={<Presentation className="size-3.5" />}
                label="Lavagna"
              />
              <TabBtn
                active={tool === "glossary"}
                onClick={() => setTool("glossary")}
                icon={<BookMarked className="size-3.5" />}
                label="Glossario"
              />
              <TabBtn
                active={tool === "code"}
                onClick={() => setTool("code")}
                icon={<Code2 className="size-3.5" />}
                label="Codice"
              />
            </div>
            <div className="ml-auto flex items-center gap-0.5">
              {tool === "notes" && <MarkdownCheatsheet />}
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setOpen(false)}
                title="Chiudi"
                aria-label="Chiudi pannello"
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>

          {/* Tool body — keep both mounted to preserve state, toggle visibility */}
          <div className="relative min-h-0 flex-1">
            <div className={cn("absolute inset-0", tool === "notes" ? "block" : "hidden")}>
              <NotebooksPanel sessionId={sessionId} initialNotebooks={notebooks} />
            </div>
            <div className={cn("absolute inset-0", tool === "whiteboard" ? "block" : "hidden")}>
              {tool === "whiteboard" && (
                <Whiteboard
                  whiteboardId={whiteboardId}
                  initialSnapshot={whiteboardSnapshot}
                />
              )}
            </div>
            <div className={cn("absolute inset-0", tool === "glossary" ? "block" : "hidden")}>
              <GlossaryPanel sessionId={sessionId} initialTerms={glossary} />
            </div>
            <div className={cn("absolute inset-0", tool === "code" ? "block" : "hidden")}>
              {tool === "code" && <CodeSandbox />}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function TabBtn({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-md px-2.5 py-1 transition-colors",
        active ? "bg-background shadow-sm" : "text-muted-foreground",
      )}
    >
      {icon}
      {label}
    </button>
  )
}
