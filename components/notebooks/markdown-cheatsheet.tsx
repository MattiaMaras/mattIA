"use client"

import { Info } from "lucide-react"
import { Markdown } from "@/components/chat/markdown"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const ROWS: { label: string; src: string }[] = [
  { label: "Titoli", src: "# Titolo 1\n## Titolo 2\n### Titolo 3" },
  { label: "Enfasi", src: "**grassetto**, *corsivo*, `codice`" },
  { label: "Elenco puntato", src: "- primo\n- secondo\n  - annidato" },
  { label: "Elenco numerato", src: "1. uno\n2. due" },
  { label: "Citazione", src: "> Una citazione importante" },
  { label: "Link", src: "[mattIA](https://example.com)" },
  { label: "Tabella", src: "| Col A | Col B |\n|-------|-------|\n| 1 | 2 |" },
  { label: "Codice", src: "```python\nprint('ciao')\n```" },
  { label: "Formula in linea", src: "L'area è $A = \\pi r^2$." },
  {
    label: "Formula a blocco",
    src: "$$\\int_0^1 x^2\\,dx = \\frac{1}{3}$$",
  },
  {
    label: "Matrice",
    src: "$$\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$$",
  },
]

export function MarkdownCheatsheet() {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            title="Guida Markdown"
            aria-label="Guida Markdown"
          >
            <Info className="size-4" />
          </Button>
        }
      />
      <DialogContent className="max-h-[85vh] gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b border-border/60 p-4">
          <DialogTitle>Guida rapida al Markdown</DialogTitle>
          <DialogDescription>
            Scrivi appunti formattati con poche regole. A sinistra cosa scrivi, a
            destra come appare.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[68vh] overflow-y-auto p-4">
          <div className="overflow-hidden rounded-xl border border-border/60">
            <div className="grid grid-cols-2 border-b border-border/60 bg-muted/60 text-xs font-medium text-muted-foreground">
              <div className="px-3 py-2">Sintassi</div>
              <div className="border-l border-border/60 px-3 py-2">Risultato</div>
            </div>
            {ROWS.map((row, i) => (
              <div
                key={row.label}
                className={
                  i % 2 ? "grid grid-cols-2 bg-muted/20" : "grid grid-cols-2"
                }
              >
                <pre className="overflow-x-auto whitespace-pre-wrap px-3 py-2.5 font-mono text-xs text-muted-foreground">
                  {row.src}
                </pre>
                <div className="border-l border-border/60 px-3 py-2.5">
                  <Markdown>{row.src}</Markdown>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Suggerimento: usa la barra degli strumenti dell&apos;editor per
            inserire automaticamente simboli e formule LaTeX.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
