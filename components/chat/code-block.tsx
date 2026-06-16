"use client"

import * as React from "react"
import { Check, Copy } from "lucide-react"
import { cn } from "@/lib/utils"

export function CodeBlock({
  code,
  lang,
}: {
  code: string
  lang?: string
}) {
  const [copied, setCopied] = React.useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="group/code my-3 overflow-hidden rounded-xl border border-border/70 bg-muted/50">
      <div className="flex items-center justify-between border-b border-border/60 bg-muted/60 px-3 py-1.5">
        <span className="font-mono text-xs text-muted-foreground">
          {lang || "code"}
        </span>
        <button
          type="button"
          onClick={copy}
          className={cn(
            "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
          )}
          aria-label="Copia codice"
        >
          {copied ? (
            <>
              <Check className="size-3.5" /> Copiato
            </>
          ) : (
            <>
              <Copy className="size-3.5" /> Copia
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-3.5 text-[0.85rem] leading-relaxed">
        <code className="font-mono">{code}</code>
      </pre>
    </div>
  )
}
