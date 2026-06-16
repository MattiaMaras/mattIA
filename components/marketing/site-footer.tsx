import { Logo } from "@/components/brand/logo"

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex w-[min(1100px,92%)] flex-col items-center justify-between gap-4 py-10 text-sm text-muted-foreground sm:flex-row">
        <Logo className="text-base" iconClassName="size-7" />
        <p>© {new Date().getFullYear()} mattIA · Studia più intelligente.</p>
        <p>Costruito per studenti di Ingegneria Informatica.</p>
      </div>
    </footer>
  )
}
