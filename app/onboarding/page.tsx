import { redirect } from "next/navigation"
import { getOrCreateProfile } from "@/lib/profile"
import { OnboardingForm } from "./onboarding-form"

export const metadata = { title: "Onboarding" }

export default async function OnboardingPage() {
  const profile = await getOrCreateProfile()
  if (profile.onboarded) redirect("/dashboard")

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-12">
      <div className="pointer-events-none absolute inset-0 bg-aurora" />
      <div className="pointer-events-none absolute inset-0 bg-grid [mask-image:radial-gradient(60%_50%_at_50%_40%,black,transparent)]" />
      <div className="relative">
        <OnboardingForm defaultName={profile.full_name ?? undefined} />
      </div>
    </div>
  )
}
