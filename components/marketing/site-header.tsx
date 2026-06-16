"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { useAuth, UserButton } from "@clerk/nextjs"
import { dark } from "@clerk/themes"
import { useTheme } from "next-themes"
import { Logo } from "@/components/brand/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"

export function SiteHeader() {
  const { isSignedIn, isLoaded } = useAuth()
  const { resolvedTheme } = useTheme()

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-50 w-full"
    >
      <div className="mx-auto mt-3 flex w-[min(1100px,94%)] items-center justify-between rounded-2xl border border-border/60 glass px-4 py-2.5">
        <Link href="/" aria-label="mattIA home">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 text-sm text-muted-foreground md:flex">
          <a href="#features" className="rounded-lg px-3 py-1.5 transition-colors hover:text-foreground">
            Funzionalità
          </a>
          <a href="#how" className="rounded-lg px-3 py-1.5 transition-colors hover:text-foreground">
            Come funziona
          </a>
        </nav>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          {isLoaded && isSignedIn ? (
            <>
              <Button variant="ghost" render={<Link href="/dashboard" />}>
                Dashboard
              </Button>
              <UserButton
                appearance={{
                  theme: resolvedTheme === "dark" ? dark : undefined,
                }}
              />
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                className="hidden sm:inline-flex"
                render={<Link href="/sign-in" />}
              >
                Accedi
              </Button>
              <Button render={<Link href="/sign-up" />}>Inizia gratis</Button>
            </>
          )}
        </div>
      </div>
    </motion.header>
  )
}
