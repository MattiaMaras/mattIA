"use client"

import { GraduationCap } from "lucide-react"
import type { UIMessage } from "ai"
import { Markdown, type GlossaryEntry } from "@/components/chat/markdown"
import { cn } from "@/lib/utils"

function getText(message: UIMessage): string {
  return message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("\n")
}

export function MessageBubble({
  message,
  glossary,
}: {
  message: UIMessage
  glossary?: GlossaryEntry[]
}) {
  const isUser = message.role === "user"
  const text = getText(message)

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-primary-foreground">
          <p className="whitespace-pre-wrap break-words leading-7">{text}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-3">
      <div className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
        <GraduationCap className="size-4.5" />
      </div>
      <div className={cn("min-w-0 flex-1 pt-0.5")}>
        {text ? (
          <Markdown glossary={glossary}>{text}</Markdown>
        ) : (
          <TypingDots />
        )}
      </div>
    </div>
  )
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-2">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-2 animate-bounce rounded-full bg-muted-foreground/50"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  )
}
