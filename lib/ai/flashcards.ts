import "server-only"
import { generateObject } from "ai"
import { z } from "zod"
import { getLanguageModel } from "@/lib/ai/providers"
import { resolveUserChatModel } from "@/lib/ai/keys"
import { retrieveContext } from "@/lib/ai/retrieval"
import { getSession } from "@/lib/sessions"
import { listNotebooks } from "@/lib/notebooks"

export class FlashcardError extends Error {}

const schema = z.object({
  cards: z.array(
    z.object({
      front: z.string().describe("Domanda o concetto (fronte)"),
      back: z.string().describe("Risposta o spiegazione concisa (retro)"),
      topic: z.string().describe("Argomento breve"),
    }),
  ),
})

export async function generateFlashcards(
  clerkUserId: string,
  sessionId: string,
  count = 10,
): Promise<{ front: string; back: string; topic: string }[]> {
  const session = await getSession(clerkUserId, sessionId)
  if (!session) throw new FlashcardError("Sessione non trovata")

  const model = await resolveUserChatModel(clerkUserId)
  if (!model) {
    throw new FlashcardError(
      "Configura una chiave AI nelle Impostazioni per generare le flashcard.",
    )
  }

  // Prefer the student's own notes; fall back to indexed materials.
  const notebooks = await listNotebooks(clerkUserId, sessionId)
  const notesText = notebooks
    .map((n) => `# ${n.title}\n${n.content}`)
    .join("\n\n")
    .trim()

  let source = notesText
  if (source.length < 80) {
    source = await retrieveContext(
      clerkUserId,
      sessionId,
      `${session.title} concetti principali da memorizzare`,
      14,
    )
  }
  if (!source || source.length < 40) {
    throw new FlashcardError(
      "Scrivi qualche appunto o carica dei materiali indicizzati per generare le flashcard.",
    )
  }

  const n = Math.min(Math.max(count, 4), 30)
  const { object } = await generateObject({
    model: getLanguageModel(model.provider, model.modelId, model.apiKey),
    schema,
    prompt: `Crea ${n} flashcard in stile Anki per ripassare la materia "${session.title}", in italiano. Ogni flashcard deve avere un fronte (domanda/concetto) e un retro (risposta concisa e corretta), più un argomento. Basati sul seguente contenuto dello studente:

=== CONTENUTO ===
${source.slice(0, 8000)}
=== FINE ===`,
  })

  return object.cards
}
