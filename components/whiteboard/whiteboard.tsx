"use client"

import * as React from "react"
import {
  Tldraw,
  getSnapshot,
  loadSnapshot,
  type Editor,
  type TLEditorSnapshot,
} from "tldraw"
import "tldraw/tldraw.css"
import { useTheme } from "next-themes"
import type { Json } from "@/lib/database.types"
import { saveWhiteboardAction } from "@/app/(app)/session/[id]/whiteboard-actions"

export default function Whiteboard({
  whiteboardId,
  initialSnapshot,
}: {
  whiteboardId: string
  initialSnapshot: Json | null
}) {
  const { resolvedTheme } = useTheme()
  const editorRef = React.useRef<Editor | null>(null)
  const saveTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleMount = React.useCallback(
    (editor: Editor) => {
      editorRef.current = editor

      // Restore persisted drawing.
      if (initialSnapshot) {
        try {
          loadSnapshot(editor.store, initialSnapshot as unknown as TLEditorSnapshot)
        } catch {
          /* ignore malformed snapshots */
        }
      }

      // Match the app theme.
      editor.user.updateUserPreferences({
        colorScheme: resolvedTheme === "dark" ? "dark" : "light",
      })

      // Debounced autosave on user document changes.
      const unlisten = editor.store.listen(
        () => {
          if (saveTimer.current) clearTimeout(saveTimer.current)
          saveTimer.current = setTimeout(() => {
            const { document } = getSnapshot(editor.store)
            saveWhiteboardAction(whiteboardId, document as unknown as Json).catch(
              () => {},
            )
          }, 1500)
        },
        { source: "user", scope: "document" },
      )

      return () => {
        unlisten()
        if (saveTimer.current) clearTimeout(saveTimer.current)
      }
    },
    [initialSnapshot, resolvedTheme, whiteboardId],
  )

  // Keep tldraw's theme in sync if the user toggles it.
  React.useEffect(() => {
    const editor = editorRef.current
    if (!editor) return
    editor.user.updateUserPreferences({
      colorScheme: resolvedTheme === "dark" ? "dark" : "light",
    })
  }, [resolvedTheme])

  return (
    <div className="absolute inset-0">
      <Tldraw onMount={handleMount} />
    </div>
  )
}
