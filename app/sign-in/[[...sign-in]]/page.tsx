"use client"

import Link from "next/link"
import { SignIn } from "@clerk/nextjs"
import { dark } from "@clerk/themes"
import { useTheme } from "next-themes"
import { Logo } from "@/components/brand/logo"

export default function SignInPage() {
  const { resolvedTheme } = useTheme()
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4 py-12">
      <div className="pointer-events-none absolute inset-0 bg-aurora" />
      <div className="pointer-events-none absolute inset-0 bg-grid [mask-image:radial-gradient(60%_50%_at_50%_40%,black,transparent)]" />
      <Link href="/" className="relative mb-8">
        <Logo />
      </Link>
      <div className="relative">
        <SignIn
          appearance={{
            theme: resolvedTheme === "dark" ? dark : undefined,
            elements: {
              cardBox: "shadow-glow border border-border/60",
            },
          }}
        />
      </div>
    </div>
  )
}
