"use client"

import { Check, ChevronDown, Sparkles, Lock } from "lucide-react"
import {
  PROVIDER_LIST,
  findModelLabel,
  type ProviderId,
} from "@/lib/ai/models"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface ModelSelection {
  provider: ProviderId
  modelId: string
}

export function ModelSwitcher({
  value,
  onChange,
  configuredProviders,
}: {
  value: ModelSelection
  onChange: (v: ModelSelection) => void
  configuredProviders: ProviderId[]
}) {
  const currentLabel = findModelLabel(value.provider, value.modelId)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="sm" className="gap-1.5">
            <Sparkles className="size-3.5 text-primary" />
            <span className="max-w-[140px] truncate">{currentLabel}</span>
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-64">
        {PROVIDER_LIST.map((p, i) => {
          const configured = configuredProviders.includes(p.id)
          return (
            <DropdownMenuGroup key={p.id}>
              {i > 0 && <DropdownMenuSeparator />}
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>{p.label}</span>
                {!configured && (
                  <span className="inline-flex items-center gap-1 text-xs font-normal text-muted-foreground">
                    <Lock className="size-3" />
                    nessuna chiave
                  </span>
                )}
              </DropdownMenuLabel>
              {p.models.map((m) => {
                const selected =
                  value.provider === p.id && value.modelId === m.id
                return (
                  <DropdownMenuItem
                    key={m.id}
                    disabled={!configured}
                    onClick={() =>
                      onChange({ provider: p.id as ProviderId, modelId: m.id })
                    }
                    className="flex items-center justify-between gap-2"
                  >
                    <span className="truncate">{m.label}</span>
                    {selected ? (
                      <Check className="size-4 shrink-0 text-primary" />
                    ) : m.recommended ? (
                      <span className="shrink-0 text-[10px] text-muted-foreground">
                        consigliato
                      </span>
                    ) : null}
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuGroup>
          )
        })}
        <DropdownMenuSeparator />
        <p className="px-2 py-1.5 text-xs text-muted-foreground">
          Aggiungi chiavi nelle Impostazioni per sbloccare altri provider.
        </p>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
