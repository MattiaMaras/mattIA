/**
 * Visual theming for Study Sessions — color accents and icon choices.
 * Class strings are written out in full so Tailwind v4 keeps them.
 */
import {
  BookOpen,
  Sigma,
  CircuitBoard,
  Atom,
  Code2,
  Database,
  Network,
  Binary,
  Cpu,
  FlaskConical,
  Calculator,
  Boxes,
  type LucideIcon,
} from "lucide-react"

export type SessionColor =
  | "violet"
  | "blue"
  | "emerald"
  | "amber"
  | "rose"
  | "cyan"

export const SESSION_COLORS: Record<
  SessionColor,
  { label: string; dot: string; soft: string; icon: string; ring: string; gradient: string }
> = {
  violet: {
    label: "Viola",
    dot: "bg-violet-500",
    soft: "bg-violet-500/10",
    icon: "text-violet-500",
    ring: "ring-violet-500/30",
    gradient: "from-violet-500/20 to-violet-500/0",
  },
  blue: {
    label: "Blu",
    dot: "bg-blue-500",
    soft: "bg-blue-500/10",
    icon: "text-blue-500",
    ring: "ring-blue-500/30",
    gradient: "from-blue-500/20 to-blue-500/0",
  },
  emerald: {
    label: "Verde",
    dot: "bg-emerald-500",
    soft: "bg-emerald-500/10",
    icon: "text-emerald-500",
    ring: "ring-emerald-500/30",
    gradient: "from-emerald-500/20 to-emerald-500/0",
  },
  amber: {
    label: "Ambra",
    dot: "bg-amber-500",
    soft: "bg-amber-500/10",
    icon: "text-amber-500",
    ring: "ring-amber-500/30",
    gradient: "from-amber-500/20 to-amber-500/0",
  },
  rose: {
    label: "Rosa",
    dot: "bg-rose-500",
    soft: "bg-rose-500/10",
    icon: "text-rose-500",
    ring: "ring-rose-500/30",
    gradient: "from-rose-500/20 to-rose-500/0",
  },
  cyan: {
    label: "Ciano",
    dot: "bg-cyan-500",
    soft: "bg-cyan-500/10",
    icon: "text-cyan-500",
    ring: "ring-cyan-500/30",
    gradient: "from-cyan-500/20 to-cyan-500/0",
  },
}

export const SESSION_ICONS: Record<string, LucideIcon> = {
  BookOpen,
  Sigma,
  CircuitBoard,
  Atom,
  Code2,
  Database,
  Network,
  Binary,
  Cpu,
  FlaskConical,
  Calculator,
  Boxes,
}

export const SESSION_ICON_NAMES = Object.keys(SESSION_ICONS)

export function sessionColor(color: string | null | undefined) {
  return SESSION_COLORS[(color as SessionColor) ?? "violet"] ?? SESSION_COLORS.violet
}

export function sessionIcon(name: string | null | undefined): LucideIcon {
  return SESSION_ICONS[name ?? "BookOpen"] ?? BookOpen
}
