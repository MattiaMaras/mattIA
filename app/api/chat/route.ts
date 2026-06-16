import { streamText, convertToModelMessages, type UIMessage } from "ai"
import { getUserId } from "@/lib/auth"
import { getSession } from "@/lib/sessions"
import { getProfile } from "@/lib/profile"
import {
  getThread,
  saveMessage,
  renameThread,
  countThreadMessages,
  textFromParts,
} from "@/lib/chat"
import { getUserApiKey } from "@/lib/ai/keys"
import { getLanguageModel } from "@/lib/ai/providers"
import { buildTutorSystemPrompt } from "@/lib/ai/prompts"
import { retrieveContext } from "@/lib/ai/retrieval"
import {
  DEFAULT_MODEL,
  DEFAULT_PROVIDER,
  isProviderId,
  type ProviderId,
} from "@/lib/ai/models"

export const maxDuration = 60

type ChatRequestBody = {
  messages: UIMessage[]
  sessionId: string
  threadId: string
  provider?: string
  modelId?: string
}

export async function POST(req: Request) {
  const userId = await getUserId()
  if (!userId) {
    return Response.json({ error: "Non autenticato" }, { status: 401 })
  }

  let body: ChatRequestBody
  try {
    body = (await req.json()) as ChatRequestBody
  } catch {
    return Response.json({ error: "Richiesta non valida" }, { status: 400 })
  }

  const { messages, sessionId, threadId } = body
  if (!sessionId || !threadId || !Array.isArray(messages)) {
    return Response.json({ error: "Parametri mancanti" }, { status: 400 })
  }

  // Authorize: session + thread must belong to the user.
  const [session, thread, profile] = await Promise.all([
    getSession(userId, sessionId),
    getThread(userId, threadId),
    getProfile(userId),
  ])
  if (!session || !thread) {
    return Response.json({ error: "Sessione non trovata" }, { status: 404 })
  }

  // Resolve provider/model: request → session default → profile default.
  const provider = pickProvider(
    body.provider,
    session.default_provider,
    profile?.default_provider,
  )
  const modelId =
    body.modelId?.trim() ||
    session.default_model ||
    profile?.default_model ||
    DEFAULT_MODEL

  const apiKey = await getUserApiKey(userId, provider)
  if (!apiKey) {
    return Response.json(
      {
        error: `Nessuna chiave API configurata per ${provider}. Aggiungila nelle Impostazioni.`,
      },
      { status: 400 },
    )
  }

  // RAG: retrieve relevant chunks from the session's materials (no-op if none).
  const lastUser = [...messages].reverse().find((m) => m.role === "user")
  const queryText = lastUser ? textFromParts(lastUser.parts) : ""
  const context = await retrieveContext(userId, sessionId, queryText)

  const system = buildTutorSystemPrompt({
    sessionTitle: session.title,
    studentName: profile?.full_name,
    context,
  })

  // Persist the incoming user message before streaming.
  if (lastUser) {
    await saveMessage(userId, threadId, {
      id: lastUser.id,
      role: "user",
      parts: lastUser.parts,
    })
    // Auto-title the thread from the first user message.
    if (thread.title === "Nuova conversazione") {
      const count = await countThreadMessages(userId, threadId)
      if (count <= 1) {
        await renameThread(userId, threadId, makeTitle(queryText))
      }
    }
  }

  const modelMessages = await convertToModelMessages(messages)
  const result = streamText({
    model: getLanguageModel(provider, modelId, apiKey),
    system,
    messages: modelMessages,
  })

  return result.toUIMessageStreamResponse({
    onFinish: async ({ responseMessage }) => {
      try {
        await saveMessage(userId, threadId, {
          id: responseMessage.id,
          role: "assistant",
          parts: responseMessage.parts,
          modelProvider: provider,
          modelId,
        })
      } catch (err) {
        console.error("Failed to persist assistant message", err)
      }
    },
    onError: (error) => {
      console.error("Chat stream error", error)
      return "Si è verificato un errore con il provider AI. Verifica la chiave API e il modello selezionato."
    },
  })
}

function pickProvider(
  ...candidates: (string | null | undefined)[]
): ProviderId {
  for (const c of candidates) {
    if (c && isProviderId(c)) return c
  }
  return DEFAULT_PROVIDER
}

function makeTitle(text: string): string {
  const clean = text.replace(/\s+/g, " ").trim()
  if (!clean) return "Nuova conversazione"
  const words = clean.split(" ").slice(0, 6).join(" ")
  return words.length > 48 ? words.slice(0, 48) + "…" : words
}
