"use client"

import * as React from "react"
import { ArrowUp, Square } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function ChatComposer({
  onSend,
  onStop,
  streaming,
  disabled,
  placeholder = "Scrivi al tuo professore…",
}: {
  onSend: (text: string) => void
  onStop?: () => void
  streaming?: boolean
  disabled?: boolean
  placeholder?: string
}) {
  const [value, setValue] = React.useState("")
  const ref = React.useRef<HTMLTextAreaElement>(null)

  function autosize() {
    const el = ref.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = Math.min(el.scrollHeight, 200) + "px"
  }

  React.useEffect(autosize, [value])

  function submit() {
    const text = value.trim()
    if (!text || disabled) return
    onSend(text)
    setValue("")
    requestAnimationFrame(() => {
      if (ref.current) ref.current.style.height = "auto"
    })
  }

  return (
    <div className="relative flex items-end gap-2 rounded-2xl border border-border/70 bg-card p-2 shadow-sm focus-within:border-primary/40 focus-within:shadow-glow">
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            submit()
          }
        }}
        rows={1}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "max-h-[200px] flex-1 resize-none bg-transparent px-2 py-1.5 text-[0.95rem] leading-7 outline-none placeholder:text-muted-foreground disabled:opacity-60",
        )}
      />
      {streaming ? (
        <Button
          size="icon"
          variant="secondary"
          onClick={onStop}
          aria-label="Ferma"
          className="shrink-0"
        >
          <Square className="size-4 fill-current" />
        </Button>
      ) : (
        <Button
          size="icon"
          onClick={submit}
          disabled={!value.trim() || disabled}
          aria-label="Invia"
          className="shrink-0"
        >
          <ArrowUp className="size-4" />
        </Button>
      )}
    </div>
  )
}
