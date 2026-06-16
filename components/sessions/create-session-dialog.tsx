"use client"

import * as React from "react"
import { useActionState } from "react"
import { Plus, Loader2 } from "lucide-react"
import {
  createSessionAction,
  type SessionFormState,
} from "@/app/(app)/dashboard/actions"
import {
  SESSION_COLORS,
  SESSION_ICONS,
  SESSION_ICON_NAMES,
  type SessionColor,
} from "@/lib/session-theme"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function CreateSessionDialog({
  triggerLabel = "Nuova sessione",
  triggerClassName,
  triggerVariant = "default",
}: {
  triggerLabel?: string
  triggerClassName?: string
  triggerVariant?: React.ComponentProps<typeof Button>["variant"]
}) {
  const [open, setOpen] = React.useState(false)
  const [color, setColor] = React.useState<SessionColor>("violet")
  const [icon, setIcon] = React.useState<string>("BookOpen")
  const [state, formAction, pending] = useActionState<SessionFormState, FormData>(
    createSessionAction,
    {},
  )

  React.useEffect(() => {
    if (state.ok) setOpen(false)
  }, [state.ok])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant={triggerVariant} className={triggerClassName}>
            <Plus className="size-4" />
            {triggerLabel}
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nuova sessione di studio</DialogTitle>
          <DialogDescription>
            Crea uno spazio dedicato a una materia: materiali, chat e appunti
            resteranno separati.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-5">
          <input type="hidden" name="color" value={color} />
          <input type="hidden" name="icon" value={icon} />

          <div className="space-y-2">
            <Label htmlFor="title">Titolo</Label>
            <Input
              id="title"
              name="title"
              required
              autoFocus
              placeholder="Es. Analisi 1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Descrizione{" "}
              <span className="text-muted-foreground">(facoltativa)</span>
            </Label>
            <Textarea
              id="description"
              name="description"
              rows={2}
              placeholder="Argomenti, professore, appello…"
            />
          </div>

          <div className="space-y-2">
            <Label>Colore</Label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(SESSION_COLORS) as SessionColor[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={SESSION_COLORS[c].label}
                  onClick={() => setColor(c)}
                  className={cn(
                    "size-7 rounded-full ring-2 ring-offset-2 ring-offset-background transition-transform",
                    SESSION_COLORS[c].dot,
                    color === c
                      ? "scale-110 ring-foreground/40"
                      : "ring-transparent hover:scale-105",
                  )}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Icona</Label>
            <div className="flex flex-wrap gap-2">
              {SESSION_ICON_NAMES.map((name) => {
                const Icon = SESSION_ICONS[name]
                const selected = icon === name
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setIcon(name)}
                    className={cn(
                      "grid size-9 place-items-center rounded-lg border transition-colors",
                      selected
                        ? cn(
                            "border-transparent",
                            SESSION_COLORS[color].soft,
                            SESSION_COLORS[color].icon,
                          )
                        : "border-border text-muted-foreground hover:bg-muted",
                    )}
                  >
                    <Icon className="size-4.5" />
                  </button>
                )
              })}
            </div>
          </div>

          {state.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          <DialogFooter>
            <Button type="submit" disabled={pending} className="w-full sm:w-auto">
              {pending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Creazione…
                </>
              ) : (
                "Crea sessione"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
