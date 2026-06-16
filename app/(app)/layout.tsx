import { redirect } from "next/navigation"
import { getOrCreateProfile } from "@/lib/profile"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Auth is enforced by middleware; here we gate on onboarding completion.
  const profile = await getOrCreateProfile()
  if (!profile.onboarded) redirect("/onboarding")

  return <>{children}</>
}
