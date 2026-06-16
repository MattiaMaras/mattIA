import { GraduationCap } from "lucide-react"
import { cn } from "@/lib/utils"

export function Logo({
  className,
  iconClassName,
  showIcon = true,
}: {
  className?: string
  iconClassName?: string
  showIcon?: boolean
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-semibold tracking-tight",
        className,
      )}
    >
      {showIcon && (
        <span
          className={cn(
            "grid size-8 place-items-center rounded-xl bg-primary text-primary-foreground shadow-glow",
            iconClassName,
          )}
        >
          <GraduationCap className="size-5" />
        </span>
      )}
      <span className="text-xl">
        matt<span className="text-gradient">IA</span>
      </span>
    </span>
  )
}
