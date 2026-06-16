import Link from "next/link"
import { KeyRound, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function ApiKeyBanner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col items-start gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary">
          <KeyRound className="size-4.5" />
        </div>
        <div>
          <p className="text-sm font-medium">Collega una chiave AI per iniziare</p>
          <p className="text-sm text-muted-foreground">
            mattIA usa le tue API key (Anthropic, OpenAI o Google). Sono cifrate e
            restano private.
          </p>
        </div>
      </div>
      <Button render={<Link href="/settings" />} className="shrink-0">
        Aggiungi chiave
        <ArrowRight className="size-4" />
      </Button>
    </div>
  )
}
