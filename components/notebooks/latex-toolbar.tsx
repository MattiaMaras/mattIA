"use client"

import {
  Bold,
  Italic,
  List,
  Heading,
  Code,
  Sigma,
  Radical,
  Divide,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface InsertSpec {
  before: string
  after?: string
  placeholder?: string
}

type Insert = (spec: InsertSpec) => void

const MATH: { label: string; tip: string; spec: InsertSpec }[] = [
  { label: "x²", tip: "Apice", spec: { before: "^{", after: "}", placeholder: "2" } },
  { label: "xₙ", tip: "Pedice", spec: { before: "_{", after: "}", placeholder: "n" } },
  { label: "𝑎/𝑏", tip: "Frazione", spec: { before: "\\frac{", after: "}{b}", placeholder: "a" } },
  { label: "√", tip: "Radice", spec: { before: "\\sqrt{", after: "}", placeholder: "x" } },
  { label: "∑", tip: "Sommatoria", spec: { before: "\\sum_{i=1}^{n} ", placeholder: "" } },
  { label: "∏", tip: "Produttoria", spec: { before: "\\prod_{i=1}^{n} ", placeholder: "" } },
  { label: "∫", tip: "Integrale", spec: { before: "\\int_{a}^{b} ", placeholder: "" } },
  { label: "∂", tip: "Derivata parziale", spec: { before: "\\frac{\\partial }{\\partial x}", placeholder: "" } },
  { label: "lim", tip: "Limite", spec: { before: "\\lim_{x \\to 0} ", placeholder: "" } },
  { label: "∞", tip: "Infinito", spec: { before: "\\infty", placeholder: "" } },
  { label: "≤", tip: "Minore uguale", spec: { before: "\\leq ", placeholder: "" } },
  { label: "≥", tip: "Maggiore uguale", spec: { before: "\\geq ", placeholder: "" } },
  { label: "≠", tip: "Diverso", spec: { before: "\\neq ", placeholder: "" } },
  { label: "≈", tip: "Circa", spec: { before: "\\approx ", placeholder: "" } },
  { label: "→", tip: "Freccia", spec: { before: "\\to ", placeholder: "" } },
  { label: "∈", tip: "Appartiene", spec: { before: "\\in ", placeholder: "" } },
  { label: "∀", tip: "Per ogni", spec: { before: "\\forall ", placeholder: "" } },
  { label: "∃", tip: "Esiste", spec: { before: "\\exists ", placeholder: "" } },
  { label: "∇", tip: "Nabla", spec: { before: "\\nabla ", placeholder: "" } },
  {
    label: "[ ]",
    tip: "Matrice",
    spec: {
      before: "\\begin{pmatrix}\na & b \\\\\nc & d\n\\end{pmatrix}",
      placeholder: "",
    },
  },
]

const GREEK: { label: string; spec: InsertSpec }[] = [
  ["α", "\\alpha "], ["β", "\\beta "], ["γ", "\\gamma "], ["δ", "\\delta "],
  ["ε", "\\epsilon "], ["θ", "\\theta "], ["λ", "\\lambda "], ["μ", "\\mu "],
  ["π", "\\pi "], ["ρ", "\\rho "], ["σ", "\\sigma "], ["τ", "\\tau "],
  ["φ", "\\phi "], ["ω", "\\omega "], ["Δ", "\\Delta "], ["Σ", "\\Sigma "],
  ["Π", "\\Pi "], ["Ω", "\\Omega "], ["Γ", "\\Gamma "], ["Φ", "\\Phi "],
].map(([label, tex]) => ({ label, spec: { before: tex } }))

export function LatexToolbar({ onInsert }: { onInsert: Insert }) {
  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-border/60 px-2 py-1.5">
      <ToolBtn tip="Grassetto" onClick={() => onInsert({ before: "**", after: "**", placeholder: "testo" })}>
        <Bold className="size-4" />
      </ToolBtn>
      <ToolBtn tip="Corsivo" onClick={() => onInsert({ before: "*", after: "*", placeholder: "testo" })}>
        <Italic className="size-4" />
      </ToolBtn>
      <ToolBtn tip="Titolo" onClick={() => onInsert({ before: "## ", placeholder: "Titolo" })}>
        <Heading className="size-4" />
      </ToolBtn>
      <ToolBtn tip="Elenco" onClick={() => onInsert({ before: "- ", placeholder: "voce" })}>
        <List className="size-4" />
      </ToolBtn>
      <ToolBtn tip="Codice" onClick={() => onInsert({ before: "```\n", after: "\n```", placeholder: "codice" })}>
        <Code className="size-4" />
      </ToolBtn>

      <Separator />

      <ToolBtn tip="Formula in linea" onClick={() => onInsert({ before: "$", after: "$", placeholder: "x" })}>
        <span className="font-serif text-sm italic">$x$</span>
      </ToolBtn>
      <ToolBtn tip="Formula a blocco" onClick={() => onInsert({ before: "$$\n", after: "\n$$", placeholder: "x" })}>
        <span className="font-serif text-sm italic">$$</span>
      </ToolBtn>
      <ToolBtn tip="Frazione" onClick={() => onInsert({ before: "\\frac{", after: "}{b}", placeholder: "a" })}>
        <Divide className="size-4" />
      </ToolBtn>
      <ToolBtn tip="Radice" onClick={() => onInsert({ before: "\\sqrt{", after: "}", placeholder: "x" })}>
        <Radical className="size-4" />
      </ToolBtn>

      {/* Math symbols popover */}
      <SymbolPopover label={<Sigma className="size-4" />} tip="Simboli matematici">
        {MATH.map((m) => (
          <SymBtn key={m.tip} title={m.tip} onClick={() => onInsert(m.spec)}>
            {m.label}
          </SymBtn>
        ))}
      </SymbolPopover>

      {/* Greek popover */}
      <SymbolPopover label={<span className="text-sm">αβγ</span>} tip="Lettere greche">
        {GREEK.map((g) => (
          <SymBtn key={g.spec.before} title={g.spec.before.trim()} onClick={() => onInsert(g.spec)}>
            {g.label}
          </SymBtn>
        ))}
      </SymbolPopover>
    </div>
  )
}

function ToolBtn({
  children,
  onClick,
  tip,
}: {
  children: React.ReactNode
  onClick: () => void
  tip: string
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={onClick}
      title={tip}
      aria-label={tip}
    >
      {children}
    </Button>
  )
}

function Separator() {
  return <span className="mx-1 h-5 w-px bg-border" />
}

function SymbolPopover({
  label,
  tip,
  children,
}: {
  label: React.ReactNode
  tip: string
  children: React.ReactNode
}) {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button type="button" variant="ghost" size="icon-sm" title={tip} aria-label={tip}>
            {label}
          </Button>
        }
      />
      <PopoverContent className="w-64 p-2">
        <div className="grid grid-cols-6 gap-1">{children}</div>
      </PopoverContent>
    </Popover>
  )
}

function SymBtn({
  children,
  onClick,
  title,
}: {
  children: React.ReactNode
  onClick: () => void
  title: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="grid h-8 place-items-center rounded-md text-sm hover:bg-muted"
    >
      {children}
    </button>
  )
}
