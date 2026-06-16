"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  FileStack,
  ImageIcon,
  Loader2,
  RefreshCw,
  Trash2,
  Upload,
} from "lucide-react"
import type { Tables } from "@/lib/database.types"
import {
  deleteDocumentAction,
  reprocessDocumentAction,
} from "@/app/(app)/session/[id]/document-actions"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

type DocumentRow = Tables<"documents">

const ACCEPT = ".pdf,image/*,.txt,.md,.markdown,.csv,.tex"

export function MaterialsSheet({
  sessionId,
  initialDocuments,
  hasEmbeddingProvider,
}: {
  sessionId: string
  initialDocuments: DocumentRow[]
  hasEmbeddingProvider: boolean
}) {
  const router = useRouter()
  const [docs, setDocs] = React.useState<DocumentRow[]>(initialDocuments)
  const [uploading, setUploading] = React.useState<string[]>([])
  const [kind, setKind] = React.useState<"material" | "exam_track">("material")
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => setDocs(initialDocuments), [initialDocuments])

  const readyCount = docs.filter((d) => d.status === "ready").length

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    const list = Array.from(files)
    for (const file of list) {
      setUploading((u) => [...u, file.name])
      try {
        const fd = new FormData()
        fd.append("file", file)
        fd.append("sessionId", sessionId)
        fd.append("kind", kind)
        const res = await fetch("/api/documents", { method: "POST", body: fd })
        const json = await res.json()
        if (json.document) {
          setDocs((d) => [json.document as DocumentRow, ...d])
        }
        if (json.error) toast.error(`${file.name}: ${json.error}`)
        else toast.success(`${file.name} indicizzato`)
      } catch {
        toast.error(`Caricamento di ${file.name} non riuscito`)
      } finally {
        setUploading((u) => u.filter((n) => n !== file.name))
      }
    }
    router.refresh()
  }

  async function onDelete(id: string) {
    setDocs((d) => d.filter((x) => x.id !== id))
    await deleteDocumentAction(sessionId, id)
    router.refresh()
  }

  async function onReprocess(id: string) {
    setDocs((d) =>
      d.map((x) => (x.id === id ? { ...x, status: "processing" } : x)),
    )
    const res = await reprocessDocumentAction(sessionId, id)
    if (res.error) toast.error(res.error)
    router.refresh()
  }

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button variant="outline" size="sm" className="gap-1.5">
            <FileStack className="size-4" />
            Materiali
            {readyCount > 0 && (
              <Badge variant="secondary" className="ml-0.5 px-1.5">
                {readyCount}
              </Badge>
            )}
          </Button>
        }
      />
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Materiali della sessione</SheetTitle>
          <SheetDescription>
            Carica dispense, PDF, appunti e tracce d&apos;esame. Il tutor userà
            questi contenuti per rispondere (RAG).
          </SheetDescription>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-4 px-4 pb-4">
          {!hasEmbeddingProvider && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>
                Per indicizzare i materiali serve una chiave{" "}
                <strong>OpenAI</strong> o <strong>Google</strong> (gli embedding
                non sono disponibili con Anthropic). Aggiungila nelle
                Impostazioni.
              </span>
            </div>
          )}

          {/* Kind toggle */}
          <div className="flex gap-1 rounded-lg bg-muted p-1 text-sm">
            <button
              type="button"
              onClick={() => setKind("material")}
              className={cn(
                "flex-1 rounded-md px-2 py-1.5 transition-colors",
                kind === "material"
                  ? "bg-background font-medium shadow-sm"
                  : "text-muted-foreground",
              )}
            >
              Materiale
            </button>
            <button
              type="button"
              onClick={() => setKind("exam_track")}
              className={cn(
                "flex-1 rounded-md px-2 py-1.5 transition-colors",
                kind === "exam_track"
                  ? "bg-background font-medium shadow-sm"
                  : "text-muted-foreground",
              )}
            >
              Traccia d&apos;esame
            </button>
          </div>

          {/* Dropzone */}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              handleFiles(e.dataTransfer.files)
            }}
            className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border/70 bg-card/40 px-4 py-8 text-center transition-colors hover:border-primary/40 hover:bg-card"
          >
            <div className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
              <Upload className="size-5" />
            </div>
            <span className="text-sm font-medium">Trascina o seleziona file</span>
            <span className="text-xs text-muted-foreground">
              PDF, immagini, testo · max 25 MB
            </span>
          </button>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />

          {/* List */}
          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto">
            {uploading.map((name) => (
              <DocRow key={`up-${name}`} name={name} status="processing" />
            ))}
            {docs.length === 0 && uploading.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Nessun materiale ancora.
              </p>
            ) : (
              docs.map((doc) => (
                <DocRow
                  key={doc.id}
                  name={doc.name}
                  status={doc.status}
                  kind={doc.kind}
                  type={doc.type}
                  chunkCount={doc.chunk_count}
                  error={doc.error}
                  onDelete={() => onDelete(doc.id)}
                  onReprocess={() => onReprocess(doc.id)}
                />
              ))
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function DocRow({
  name,
  status,
  kind,
  type,
  chunkCount,
  error,
  onDelete,
  onReprocess,
}: {
  name: string
  status: string
  kind?: string
  type?: string | null
  chunkCount?: number
  error?: string | null
  onDelete?: () => void
  onReprocess?: () => void
}) {
  const Icon = type === "image" ? ImageIcon : FileText
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-card p-3">
      <div className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="size-4.5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium">{name}</p>
          {kind === "exam_track" && (
            <Badge variant="secondary" className="shrink-0 text-[10px]">
              traccia
            </Badge>
          )}
        </div>
        <div className="mt-1 text-xs">
          {status === "ready" && (
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-500">
              <CheckCircle2 className="size-3.5" />
              Pronto · {chunkCount ?? 0} parti
            </span>
          )}
          {(status === "processing" || status === "pending") && (
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" />
              Elaborazione…
            </span>
          )}
          {status === "error" && (
            <span className="inline-flex items-start gap-1 text-destructive">
              <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
              <span>{error || "Errore"}</span>
            </span>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-0.5">
        {status === "error" && onReprocess && (
          <button
            type="button"
            onClick={onReprocess}
            aria-label="Riprova"
            className="rounded p-1 text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="size-3.5" />
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            aria-label="Elimina"
            className="rounded p-1 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="size-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}
