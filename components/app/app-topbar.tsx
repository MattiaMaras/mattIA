"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserButton } from "@clerk/nextjs"
import { dark } from "@clerk/themes"
import { useTheme } from "next-themes"
import { Logo } from "@/components/brand/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/settings", label: "Impostazioni" },
]

export function AppTopbar({ children }: { children?: React.ReactNode }) {
  const { resolvedTheme } = useTheme()
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 glass">
      <div className="flex h-14 items-center gap-4 px-4 sm:px-6">
        <Link href="/dashboard" aria-label="Dashboard">
          <Logo className="text-lg" iconClassName="size-7" />
        </Link>

        <nav className="hidden items-center gap-0.5 sm:flex">
          {NAV.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-muted font-medium text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex-1">{children}</div>
        <ThemeToggle />
        <UserButton
          appearance={{ theme: resolvedTheme === "dark" ? dark : undefined }}
        />
      </div>
    </header>
  )
}
