"use client"

import * as React from "react"
import { toast } from "sonner"
import { Loader2, Sparkles } from "lucide-react"
import {
  PROVIDERS,
  PROVIDER_LIST,
  type ProviderId,
} from "@/lib/ai/models"
import { setDefaultModelAction } from "@/app/(app)/settings/actions"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function DefaultModelSelector({
  defaultProvider,
  defaultModel,
  configuredProviders,
}: {
  defaultProvider: ProviderId
  defaultModel: string
  configuredProviders: ProviderId[]
}) {
  const [provider, setProvider] = React.useState<ProviderId>(defaultProvider)
  const [model, setModel] = React.useState<string>(defaultModel)
  const [pending, startTransition] = React.useTransition()

  const models = PROVIDERS[provider].models
  const dirty = provider !== defaultProvider || model !== defaultModel

  function onProviderChange(next: string) {
    const p = next as ProviderId
    setProvider(p)
    // reset to the recommended model of the new provider
    const rec = PROVIDERS[p].models.find((m) => m.recommended) ?? PROVIDERS[p].models[0]
    setModel(rec.id)
  }

  function onSave() {
    startTransition(async () => {
      const res = await setDefaultModelAction(provider, model)
      if (res.error) toast.error(res.error)
      else toast.success("Modello predefinito aggiornato")
    })
  }

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2">
        <Sparkles className="size-4 text-primary" />
        <h3 className="font-medium">Modello predefinito</h3>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Usato all&apos;avvio di ogni chat. Potrai sempre cambiarlo al volo dentro
        una sessione.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Provider
          </label>
          <Select
            value={provider}
            onValueChange={(v) => v && onProviderChange(v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PROVIDER_LIST.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.label}
                  {!configuredProviders.includes(p.id) && (
                    <span className="ml-1 text-muted-foreground">
                      (nessuna chiave)
                    </span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Modello
          </label>
          {PROVIDERS[provider].allowCustomModel ? (
            <Input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="es. llama3.2"
              className="font-mono"
              list={`models-${provider}`}
            />
          ) : (
            <Select value={model} onValueChange={(v) => v && setModel(v)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {models.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.label}
                    {m.recommended && (
                      <span className="ml-1 text-primary">· consigliato</span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {PROVIDERS[provider].allowCustomModel && (
            <datalist id={`models-${provider}`}>
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </datalist>
          )}
        </div>
      </div>

      {!configuredProviders.includes(provider) && (
        <p className="mt-3 text-xs text-amber-600 dark:text-amber-500">
          Aggiungi una chiave {PROVIDERS[provider].label} qui sopra per usare
          questo modello.
        </p>
      )}

      <div className="mt-4 flex justify-end">
        <Button onClick={onSave} disabled={pending || !dirty}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : "Salva"}
        </Button>
      </div>
    </Card>
  )
}
