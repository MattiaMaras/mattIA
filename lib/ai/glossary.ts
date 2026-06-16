import "server-only"
import { generateObject } from "ai"
import { z } from "zod"
import { getLanguageModel } from "@/lib/ai/providers"
import { resolveUserChatModel } from "@/lib/ai/keys"
import { retrieveContext } from "@/lib/ai/retrieval"
import { getSession } from "@/lib/sessions"

export class GlossaryError extends Error {}

const schema = z.object({
  terms: z.array(
    z.object({
      term: z.string().describe("Concetto o termine chiave (1-4 parole)"),
      definition: z
        .string()
        .describe("Definizione contestuale chiara, 1-2 frasi in italiano"),
    }),
  ),
})

export async function generateGlossary(
  clerkUserId: string,
  sessionId: string,
): Promise<{ term: string; definition: string }[]> {
  const session = await getSession(clerkUserId, sessionId)
  if (!session) throw new GlossaryError("Sessione non trovata")

  const model = await resolveUserChatModel(clerkUserId)
  if (!model) {
    throw new GlossaryError(
      "Configura una chiave AI nelle Impostazioni per generare il glossario.",
    )
  }

  const context = await retrieveContext(
    clerkUserId,
    sessionId,
    `${session.title} concetti chiave definizioni glossario`,
    16,
  )
  if (!context) {
    throw new GlossaryError(
      "Carica e indicizza dei materiali (con chiave OpenAI/Google) per estrarre il glossario.",
    )
  }

  const { object } = await generateObject({
    model: getLanguageModel(model.provider, model.modelId, model.apiKey),
    schema,
    prompt: `Estrai i concetti chiave dalla materia "${session.title}" basandoti sui materiali dello studente. Per ciascuno fornisci una definizione contestuale chiara e concisa in italiano. Estrai da 10 a 25 termini, dai più importanti. Evita duplicati.

=== MATERIALI ===
${context}
=== FINE ===`,
  })

  return object.terms
}
