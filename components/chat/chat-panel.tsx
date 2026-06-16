"use client"

import * as React from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, type UIMessage } from "ai"
import { toast } from "sonner"
import { GraduationCap, Sparkles } from "lucide-react"
import type { ProviderId } from "@/lib/ai/models"
import type { GlossaryEntry } from "@/components/chat/markdown"
import { MessageBubble } from "@/components/chat/message-bubble"
import { ChatComposer } from "@/components/chat/chat-composer"
import { ModelSwitcher, type ModelSelection } from "@/components/chat/model-switcher"

const SUGGESTIONS = [
  "Spiegami questo argomento partendo dalle basi",
  "Fammi un esempio pratico passo passo",
  "Interrogami con 3 domande su questo capitolo",
  "Riassumi i concetti chiave in punti",
]

export function ChatPanel({
  sessionId,
  threadId,
  initialMessages,
  initialModel,
  configuredProviders,
  headerActions,
  glossary,
}: {
  sessionId: string
  threadId: string
  initialMessages: UIMessage[]
  initialModel: ModelSelection
  configuredProviders: ProviderId[]
  headerActions?: React.ReactNode
  glossary?: GlossaryEntry[]
}) {
  const [model, setModel] = React.useState<ModelSelection>(initialModel)
  const modelRef = React.useRef(model)
  modelRef.current = model

  const { messages, sendMessage, status, stop } = useChat({
    id: threadId,
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      prepareSendMessagesRequest: ({ messages, body }) => ({
        body: {
          ...body,
          messages,
          sessionId,
          threadId,
          provider: modelRef.current.provider,
          modelId: modelRef.current.modelId,
        },
      }),
    }),
    onError: (error) => {
      toast.error(error.message || "Errore durante la generazione")
    },
  })

  const streaming = status === "streaming" || status === "submitted"
  const hasKey = configuredProviders.length > 0

  const bottomRef = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  function send(text: string) {
    if (!hasKey) {
      toast.error("Aggiungi una chiave AI nelle Impostazioni per iniziare.")
      return
    }
    sendMessage({ text })
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-border/60 px-4 py-2.5">
        <span className="text-sm font-medium text-muted-foreground">
          Tutor AI
        </span>
        <div className="flex items-center gap-1.5">
          <ModelSwitcher
            value={model}
            onChange={setModel}
            configuredProviders={configuredProviders}
          />
          {headerActions}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-4 py-6">
          {messages.length === 0 ? (
            <EmptyChat onPick={send} disabled={!hasKey} />
          ) : (
            <div className="space-y-6">
              {messages.map((m) => (
                <MessageBubble key={m.id} message={m} glossary={glossary} />
              ))}
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Composer */}
      <div className="border-t border-border/60 bg-background/60 px-4 py-3">
        <div className="mx-auto w-full max-w-3xl">
          <ChatComposer
            onSend={send}
            onStop={stop}
            streaming={streaming}
            disabled={!hasKey}
            placeholder={
              hasKey
                ? "Scrivi al tuo professore…"
                : "Aggiungi una chiave AI nelle Impostazioni per iniziare"
            }
          />
          <p className="mt-2 text-center text-xs text-muted-foreground">
            mattIA può commettere errori. Verifica le informazioni importanti.
          </p>
        </div>
      </div>
    </div>
  )
}

function EmptyChat({
  onPick,
  disabled,
}: {
  onPick: (text: string) => void
  disabled?: boolean
}) {
  return (
    <div className="flex flex-col items-center py-12 text-center">
      <div className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
        <GraduationCap className="size-7" />
      </div>
      <h2 className="mt-5 text-lg font-medium">Il tuo professore è pronto</h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Fai una domanda sui tuoi materiali, chiedi una spiegazione o lasciati
        interrogare.
      </p>
      <div className="mt-6 grid w-full max-w-md gap-2 sm:grid-cols-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            disabled={disabled}
            onClick={() => onPick(s)}
            className="flex items-start gap-2 rounded-xl border border-border/60 bg-card/50 p-3 text-left text-sm transition-colors hover:border-primary/40 hover:bg-card disabled:opacity-50"
          >
            <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}
