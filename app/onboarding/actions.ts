"use server"

import { redirect } from "next/navigation"
import { z } from "zod"
import { requireUserId } from "@/lib/auth"
import { getOrCreateProfile } from "@/lib/profile"
import { supabaseAdmin } from "@/lib/supabase/admin"

const schema = z.object({
  full_name: z.string().trim().min(1, "Inserisci il tuo nome").max(120),
  university: z.string().trim().max(160).optional().or(z.literal("")),
  degree_program: z.string().trim().max(160).optional().or(z.literal("")),
  year_of_study: z.coerce.number().int().min(1).max(8).optional(),
  study_goal: z.string().trim().max(500).optional().or(z.literal("")),
})

export type OnboardingState = { error?: string }

export async function completeOnboarding(
  _prev: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const userId = await requireUserId()
  await getOrCreateProfile()

  const parsed = schema.safeParse({
    full_name: formData.get("full_name"),
    university: formData.get("university"),
    degree_program: formData.get("degree_program"),
    year_of_study: formData.get("year_of_study") || undefined,
    study_goal: formData.get("study_goal"),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dati non validi" }
  }

  const { full_name, university, degree_program, year_of_study, study_goal } =
    parsed.data

  const { error } = await supabaseAdmin()
    .from("profiles")
    .update({
      full_name,
      university: university || null,
      degree_program: degree_program || null,
      year_of_study: year_of_study ?? null,
      study_goal: study_goal || null,
      onboarded: true,
    })
    .eq("clerk_user_id", userId)

  if (error) return { error: "Salvataggio non riuscito. Riprova." }

  redirect("/dashboard")
}
