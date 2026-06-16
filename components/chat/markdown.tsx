"use client"

import * as React from "react"
import ReactMarkdown, { type Components } from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import "katex/dist/katex.min.css"
import { CodeBlock } from "@/components/chat/code-block"

export interface GlossaryEntry {
  term: string
  definition: string
}

/* Minimal hast node shapes we touch. */
type HastNode = {
  type: string
  tagName?: string
  value?: string
  properties?: Record<string, unknown>
  children?: HastNode[]
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

/** rehype plugin: wrap known glossary terms in <abbr> with a definition title. */
function rehypeGlossary(entries: GlossaryEntry[]) {
  const map = new Map<string, string>()
  for (const e of entries) {
    if (e.term.trim()) map.set(e.term.trim().toLowerCase(), e.definition)
  }
  const terms = [...map.keys()].sort((a, b) => b.length - a.length)
  const SKIP = new Set(["code", "pre", "a", "abbr"])
  if (terms.length === 0) return () => {}
  const re = new RegExp(`\\b(${terms.map(escapeRegExp).join("|")})\\b`, "gi")

  return (tree: HastNode) => {
    const walk = (node: HastNode) => {
      if (!node.children) return
      const out: HastNode[] = []
      for (const child of node.children) {
        if (child.type === "element") {
          if (!SKIP.has(child.tagName ?? "")) walk(child)
          out.push(child)
        } else if (child.type === "text" && child.value) {
          out.push(...splitText(child.value))
        } else {
          out.push(child)
        }
      }
      node.children = out
    }
    const splitText = (value: string): HastNode[] => {
      const parts: HastNode[] = []
      let last = 0
      let m: RegExpExecArray | null
      re.lastIndex = 0
      while ((m = re.exec(value))) {
        const word = m[1]
        const def = map.get(word.toLowerCase())
        if (m.index > last)
          parts.push({ type: "text", value: value.slice(last, m.index) })
        if (def) {
          parts.push({
            type: "element",
            tagName: "abbr",
            properties: { className: ["glossary-term"], title: def },
            children: [{ type: "text", value: word }],
          })
        } else {
          parts.push({ type: "text", value: word })
        }
        last = m.index + word.length
      }
      if (last < value.length)
        parts.push({ type: "text", value: value.slice(last) })
      return parts.length ? parts : [{ type: "text", value }]
    }
    walk(tree)
  }
}

const components: Components = {
  abbr: ({ children, title }) => (
    <abbr
      title={title}
      className="cursor-help underline decoration-primary/60 decoration-dotted underline-offset-2"
    >
      {children}
    </abbr>
  ),
  // Remove the default <pre> wrapper; block code is rendered by CodeBlock.
  pre: ({ children }) => <>{children}</>,
  code({ className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || "")
    const text = String(children ?? "").replace(/\n$/, "")
    if (match || text.includes("\n")) {
      return <CodeBlock code={text} lang={match?.[1]} />
    }
    return (
      <code
        className="rounded-md border border-border/60 bg-muted px-1.5 py-0.5 font-mono text-[0.85em]"
        {...props}
      >
        {children}
      </code>
    )
  },
  h1: ({ children }) => (
    <h1 className="mt-5 mb-2 text-xl font-semibold tracking-tight first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-5 mb-2 text-lg font-semibold tracking-tight first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-4 mb-1.5 text-base font-semibold first:mt-0">{children}</h3>
  ),
  p: ({ children }) => <p className="my-2.5 leading-7 first:mt-0 last:mb-0">{children}</p>,
  ul: ({ children }) => (
    <ul className="my-2.5 ml-5 list-disc space-y-1 marker:text-muted-foreground">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="my-2.5 ml-5 list-decimal space-y-1 marker:text-muted-foreground">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-7">{children}</li>,
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
    >
      {children}
    </a>
  ),
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  blockquote: ({ children }) => (
    <blockquote className="my-3 border-l-2 border-primary/50 pl-4 text-muted-foreground italic">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-5 border-border/60" />,
  table: ({ children }) => (
    <div className="my-3 overflow-x-auto rounded-xl border border-border/60">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-muted/60">{children}</thead>,
  th: ({ children }) => (
    <th className="border-b border-border/60 px-3 py-2 text-left font-medium">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b border-border/40 px-3 py-2">{children}</td>
  ),
}

export const Markdown = React.memo(function Markdown({
  children,
  glossary,
}: {
  children: string
  glossary?: GlossaryEntry[]
}) {
  const rehypePlugins = React.useMemo(() => {
    const base: NonNullable<
      React.ComponentProps<typeof ReactMarkdown>["rehypePlugins"]
    > = [rehypeKatex]
    if (glossary && glossary.length > 0) {
      base.push([rehypeGlossary, glossary])
    }
    return base
  }, [glossary])

  return (
    <div className="text-[0.95rem] text-foreground/90">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={rehypePlugins}
        components={components}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
})
