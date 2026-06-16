"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  Check,
  ExternalLink,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Trash2,
} from "lucide-react"
import { PROVIDER_LIST, type ProviderId } from "@/lib/ai/models"
import type { ApiKeyStatus } from "@/lib/ai/keys"
import { saveApiKeyAction, deleteApiKeyAction } from "@/app/(app)/settings/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function ApiKeysManager({ statuses }: { statuses: ApiKeyStatus[] }) {
  const statusMap = React.useMemo(() => {
    const m = new Map<ProviderId, string | null>()
    for (const s of statuses) m.set(s.provider, s.last4)
    return m
  }, [statuses])

  return (
    <div className="space-y-4">
      {PROVIDER_LIST.map((p) => (
        <ProviderKeyRow
          key={p.id}
          providerId={p.id}
          label={p.label}
          keyHint={p.keyHint}
          docsUrl={p.docsUrl}
          local={p.local}
          defaultHost={p.defaultHost}
          configuredLast4={statusMap.get(p.id) ?? null}
          isConfigured={statusMap.has(p.id)}
        />
      ))}
    </div>
  )
}

function ProviderKeyRow({
  providerId,
  label,
  keyHint,
  docsUrl,
  local,
  defaultHost,
  configuredLast4,
  isConfigured,
}: {
  providerId: ProviderId
  label: string
  keyHint: string
  docsUrl: string
  local?: boolean
  defaultHost?: string
  configuredLast4: string | null
  isConfigured: boolean
}) {
  const [value, setValue] = React.useState(
    local && !isConfigured ? (defaultHost ?? "") : "",
  )
  const [reveal, setReveal] = React.useState(false)
  const [pending, startTransition] = React.useTransition()
  const [editing, setEditing] = React.useState(!isConfigured)

  function onSave() {
    startTransition(async () => {
      const res = await saveApiKeyAction(providerId, value)
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success(`Chiave ${label} salvata`)
        setValue("")
        setEditing(false)
      }
    })
  }

  function onDelete() {
    startTransition(async () => {
      const res = await deleteApiKeyAction(providerId)
      if (res.error) toast.error(res.error)
      else {
        toast.success(`Chiave ${label} rimossa`)
        setEditing(true)
      }
    })
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-lg bg-muted text-muted-foreground">
            <KeyRound className="size-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{label}</span>
              {isConfigured && (
                <Badge variant="secondary" className="gap-1">
                  <Check className="size-3" />
                  {local ? "Configurato" : "Configurata"}
                </Badge>
              )}
              {local && (
                <Badge variant="secondary" className="text-[10px]">
                  gratis · locale
                </Badge>
              )}
            </div>
            <a
              href={docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              {local ? "Modelli Ollama" : "Ottieni una chiave"}
              <ExternalLink className="size-3" />
            </a>
          </div>
        </div>

        {isConfigured && !editing && (
          <div className="flex items-center gap-2">
            <code className="rounded bg-muted px-2 py-1 text-xs text-muted-foreground">
              ••••{configuredLast4}
            </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditing(true)}
              disabled={pending}
            >
              Aggiorna
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onDelete}
              disabled={pending}
              aria-label={`Rimuovi chiave ${label}`}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        )}
      </div>

      {editing && (
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Input
              type={local ? "text" : reveal ? "text" : "password"}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={keyHint}
              autoComplete="off"
              className={local ? "font-mono" : "pr-9 font-mono"}
              onKeyDown={(e) => {
                if (e.key === "Enter" && value.trim()) onSave()
              }}
            />
            {!local && (
              <button
                type="button"
                onClick={() => setReveal((r) => !r)}
                className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={reveal ? "Nascondi" : "Mostra"}
              >
                {reveal ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={onSave} disabled={pending || !value.trim()}>
              {pending ? <Loader2 className="size-4 animate-spin" /> : "Salva"}
            </Button>
            {isConfigured && (
              <Button
                variant="ghost"
                onClick={() => {
                  setEditing(false)
                  setValue("")
                }}
                disabled={pending}
              >
                Annulla
              </Button>
            )}
          </div>
        </div>
      )}
    </Card>
  )
}
