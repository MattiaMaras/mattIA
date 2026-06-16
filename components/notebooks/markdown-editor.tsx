"use client"

import * as React from "react"
import { Check, Eye, FileDown, Loader2, Pencil } from "lucide-react"
import { saveNotebookAction } from "@/app/(app)/session/[id]/notebook-actions"
import { Markdown } from "@/components/chat/markdown"
import { LatexToolbar, type InsertSpec } from "@/components/notebooks/latex-toolbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type SaveState = "idle" | "saving" | "saved"

export function MarkdownEditor({
  sessionId,
  notebookId,
  initialTitle,
  initialContent,
  onMeta,
}: {
  sessionId: string
  notebookId: string
  initialTitle: string
  initialContent: string
  onMeta?: (id: string, meta: { title: string }) => void
}) {
  const [title, setTitle] = React.useState(initialTitle)
  const [content, setContent] = React.useState(initialContent)
  const [mode, setMode] = React.useState<"write" | "preview">("write")
  const [save, setSave] = React.useState<SaveState>("idle")
  const taRef = React.useRef<HTMLTextAreaElement>(null)
  const previewRef = React.useRef<HTMLDivElement>(null)
  const dirty = React.useRef(false)

  // Reset when switching notebooks.
  React.useEffect(() => {
    setTitle(initialTitle)
    setContent(initialContent)
    dirty.current = false
    setSave("idle")
  }, [notebookId, initialTitle, initialContent])

  // Debounced autosave.
  React.useEffect(() => {
    if (!dirty.current) return
    setSave("saving")
    const t = setTimeout(async () => {
      await saveNotebookAction(sessionId, notebookId, { title, content })
      onMeta?.(notebookId, { title })
      setSave("saved")
    }, 800)
    return () => clearTimeout(t)
  }, [title, content, sessionId, notebookId, onMeta])

  function insert(spec: InsertSpec) {
    const el = taRef.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    const after = spec.after ?? ""
    const selected = content.slice(start, end) || spec.placeholder || ""
    const next =
      content.slice(0, start) + spec.before + selected + after + content.slice(end)
    dirty.current = true
    setContent(next)
    const selStart = start + spec.before.length
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(selStart, selStart + selected.length)
    })
  }

  function exportPdf() {
    const html = previewRef.current?.innerHTML ?? ""
    const win = window.open("", "_blank", "width=840,height=1000")
    if (!win) return
    win.document.write(`<!doctype html><html lang="it"><head><meta charset="utf-8" />
<title>${escapeHtml(title)}</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css" />
<style>
  *{box-sizing:border-box}
  body{font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;max-width:720px;margin:48px auto;padding:0 24px;color:#18181b;line-height:1.7;font-size:15px}
  h1{font-size:1.7rem;margin:0 0 1.2rem}
  h2{font-size:1.3rem;margin:1.6rem 0 .6rem}
  h3{font-size:1.1rem;margin:1.3rem 0 .4rem}
  p{margin:.6rem 0}
  pre{background:#f4f4f5;padding:14px;border-radius:10px;overflow:auto;font-size:.85em}
  code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
  :not(pre)>code{background:#f4f4f5;padding:2px 5px;border-radius:5px;font-size:.85em}
  table{border-collapse:collapse;width:100%;margin:1rem 0}
  th,td{border:1px solid #e4e4e7;padding:8px 10px;text-align:left}
  th{background:#fafafa}
  blockquote{border-left:3px solid #d4d4d8;margin:1rem 0;padding:.2rem 0 .2rem 14px;color:#52525b}
  ul,ol{padding-left:1.4rem}
  hr{border:none;border-top:1px solid #e4e4e7;margin:1.5rem 0}
  @media print{body{margin:0}}
</style></head>
<body><h1>${escapeHtml(title)}</h1>${html}</body></html>`)
    win.document.close()
    win.focus()
    // Give KaTeX CSS a moment to load, then print.
    setTimeout(() => win.print(), 400)
  }

  return (
    <div className="flex h-full flex-col">
      {/* Editor header */}
      <div className="flex items-center gap-2 border-b border-border/60 px-2 py-1.5">
        <Input
          value={title}
          onChange={(e) => {
            dirty.current = true
            setTitle(e.target.value)
          }}
          className="h-8 border-0 bg-transparent px-1 text-sm font-medium shadow-none focus-visible:ring-0"
          placeholder="Titolo del taccuino"
        />
        <SaveIndicator state={save} />
        <div className="flex items-center rounded-lg bg-muted p-0.5">
          <button
            type="button"
            onClick={() => setMode("write")}
            className={cn(
              "flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors",
              mode === "write" ? "bg-background shadow-sm" : "text-muted-foreground",
            )}
          >
            <Pencil className="size-3.5" /> Scrivi
          </button>
          <button
            type="button"
            onClick={() => setMode("preview")}
            className={cn(
              "flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors",
              mode === "preview" ? "bg-background shadow-sm" : "text-muted-foreground",
            )}
          >
            <Eye className="size-3.5" /> Anteprima
          </button>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={exportPdf}
          title="Esporta in PDF"
          aria-label="Esporta in PDF"
        >
          <FileDown className="size-4" />
        </Button>
      </div>

      {mode === "write" && <LatexToolbar onInsert={insert} />}

      {/* Body */}
      <div className="relative min-h-0 flex-1">
        <textarea
          ref={taRef}
          value={content}
          onChange={(e) => {
            dirty.current = true
            setContent(e.target.value)
          }}
          placeholder="Scrivi i tuoi appunti in Markdown… Usa la barra per simboli e formule LaTeX."
          className={cn(
            "absolute inset-0 h-full w-full resize-none bg-transparent p-4 font-mono text-sm leading-7 outline-none placeholder:text-muted-foreground",
            mode === "write" ? "block" : "hidden",
          )}
        />
        <div
          className={cn(
            "absolute inset-0 h-full overflow-y-auto p-4",
            mode === "preview" ? "block" : "hidden",
          )}
        >
          <div ref={previewRef}>
            {content.trim() ? (
              <Markdown>{content}</Markdown>
            ) : (
              <p className="text-sm text-muted-foreground">
                Niente da mostrare. Scrivi qualcosa nella scheda «Scrivi».
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function SaveIndicator({ state }: { state: SaveState }) {
  if (state === "saving")
    return (
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <Loader2 className="size-3 animate-spin" /> Salvataggio…
      </span>
    )
  if (state === "saved")
    return (
      <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-500">
        <Check className="size-3" /> Salvato
      </span>
    )
  return null
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}
