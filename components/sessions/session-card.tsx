"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { MoreVertical, Trash2, ArrowUpRight } from "lucide-react"
import { deleteSessionAction } from "@/app/(app)/dashboard/actions"
import { sessionColor, sessionIcon } from "@/lib/session-theme"
import type { StudySession } from "@/lib/sessions"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function SessionCard({
  session,
  index = 0,
}: {
  session: StudySession
  index?: number
}) {
  const color = sessionColor(session.color)
  const Icon = sessionIcon(session.icon)
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)

  async function onDelete() {
    setDeleting(true)
    try {
      await deleteSessionAction(session.id)
    } finally {
      setDeleting(false)
      setConfirmOpen(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index, 8) * 0.04 }}
      className="group relative"
    >
      <Link
        href={`/session/${session.id}`}
        className={cn(
          "block h-full overflow-hidden rounded-2xl border border-border/60 bg-card p-5 transition-all hover:border-foreground/15 hover:shadow-lg",
        )}
      >
        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b opacity-70",
            color.gradient,
          )}
        />
        <div className="relative flex items-start justify-between">
          <div
            className={cn(
              "grid size-11 place-items-center rounded-xl",
              color.soft,
              color.icon,
            )}
          >
            <Icon className="size-5.5" />
          </div>
          <ArrowUpRight className="size-5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        </div>

        <h3 className="relative mt-4 font-medium tracking-tight">
          {session.title}
        </h3>
        {session.description && (
          <p className="relative mt-1 line-clamp-2 text-sm text-muted-foreground">
            {session.description}
          </p>
        )}
        <p className="relative mt-4 text-xs text-muted-foreground">
          Aggiornata{" "}
          {new Date(session.updated_at).toLocaleDateString("it-IT", {
            day: "numeric",
            month: "short",
          })}
        </p>
      </Link>

      {/* Menu (outside the Link to avoid nested interactive issues) */}
      <div className="absolute top-3 right-3">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="opacity-0 transition-opacity group-hover:opacity-100 data-[popup-open]:opacity-100"
                aria-label="Opzioni sessione"
              >
                <MoreVertical className="size-4" />
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setConfirmOpen(true)}
            >
              <Trash2 className="size-4" />
              Elimina
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Eliminare «{session.title}»?</DialogTitle>
            <DialogDescription>
              Verranno eliminati definitivamente chat, materiali, appunti e
              simulazioni di questa sessione. L&apos;azione è irreversibile.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={deleting}
            >
              Annulla
            </Button>
            <Button
              variant="destructive"
              onClick={onDelete}
              disabled={deleting}
            >
              {deleting ? "Eliminazione…" : "Elimina"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
