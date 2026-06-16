"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Timer as TimerIcon,
  Play,
  Pause,
  RotateCcw,
  Coffee,
  BookOpen,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

type Mode = "stopwatch" | "pomodoro"
type Phase = "work" | "break"

const WORK_MIN = 25
const BREAK_MIN = 5
const STORE_KEY = "mattia.timer.v1"

interface TimerState {
  mode: Mode
  phase: Phase
  running: boolean
  // accumulated ms while paused; plus live delta when running
  elapsed: number
  startedAt: number | null
  cycles: number
  open: boolean
  visible: boolean
}

const initial: TimerState = {
  mode: "pomodoro",
  phase: "work",
  running: false,
  elapsed: 0,
  startedAt: null,
  cycles: 0,
  open: false,
  visible: false,
}

function phaseTarget(state: TimerState): number {
  if (state.mode === "stopwatch") return Infinity
  return (state.phase === "work" ? WORK_MIN : BREAK_MIN) * 60 * 1000
}

export function StudyTimer() {
  const [state, setState] = React.useState<TimerState>(initial)
  const [now, setNow] = React.useState(Date.now())
  const loaded = React.useRef(false)

  // Load persisted state once.
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY)
      if (raw) setState({ ...initial, ...JSON.parse(raw), open: false })
    } catch {
      /* ignore */
    }
    loaded.current = true
  }, [])

  // Persist on change.
  React.useEffect(() => {
    if (!loaded.current) return
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(state))
    } catch {
      /* ignore */
    }
  }, [state])

  // Tick while running.
  React.useEffect(() => {
    if (!state.running) return
    const id = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(id)
  }, [state.running])

  const liveElapsed =
    state.elapsed + (state.running && state.startedAt ? now - state.startedAt : 0)

  // Handle pomodoro phase completion.
  React.useEffect(() => {
    if (state.mode !== "pomodoro" || !state.running) return
    const target = phaseTarget(state)
    if (liveElapsed >= target) {
      const nextPhase: Phase = state.phase === "work" ? "break" : "work"
      const cycles = state.phase === "work" ? state.cycles + 1 : state.cycles
      setState((s) => ({
        ...s,
        phase: nextPhase,
        cycles,
        elapsed: 0,
        startedAt: Date.now(),
      }))
      notify(nextPhase)
    }
  }, [liveElapsed, state])

  function start() {
    setState((s) => ({
      ...s,
      running: true,
      startedAt: Date.now(),
      visible: true,
    }))
  }
  function pause() {
    setState((s) => ({
      ...s,
      running: false,
      elapsed:
        s.elapsed + (s.startedAt ? Date.now() - s.startedAt : 0),
      startedAt: null,
    }))
  }
  function reset() {
    setState((s) => ({
      ...s,
      running: false,
      elapsed: 0,
      startedAt: null,
      phase: "work",
      cycles: 0,
    }))
  }
  function setMode(mode: Mode) {
    setState((s) => ({
      ...s,
      mode,
      running: false,
      elapsed: 0,
      startedAt: null,
      phase: "work",
    }))
  }

  const target = phaseTarget(state)
  const remaining =
    state.mode === "pomodoro" ? Math.max(0, target - liveElapsed) : liveElapsed
  const display = formatMs(remaining)
  const progress =
    state.mode === "pomodoro" && target !== Infinity
      ? Math.min(1, liveElapsed / target)
      : 0

  if (!state.visible && !state.running && state.elapsed === 0) {
    // Idle pill — click to reveal
    return (
      <button
        type="button"
        onClick={() => setState((s) => ({ ...s, visible: true, open: true }))}
        className="fixed bottom-4 right-4 z-30 grid size-11 place-items-center rounded-full border border-border/60 glass text-muted-foreground shadow-lg transition-colors hover:text-foreground"
        aria-label="Apri timer"
      >
        <TimerIcon className="size-5" />
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-30">
      <AnimatePresence mode="wait">
        {state.open ? (
          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.18 }}
            className="w-64 rounded-2xl border border-border/60 glass p-4 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center rounded-lg bg-muted p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setMode("pomodoro")}
                  className={cn(
                    "rounded-md px-2 py-1 transition-colors",
                    state.mode === "pomodoro"
                      ? "bg-background shadow-sm"
                      : "text-muted-foreground",
                  )}
                >
                  Pomodoro
                </button>
                <button
                  type="button"
                  onClick={() => setMode("stopwatch")}
                  className={cn(
                    "rounded-md px-2 py-1 transition-colors",
                    state.mode === "stopwatch"
                      ? "bg-background shadow-sm"
                      : "text-muted-foreground",
                  )}
                >
                  Cronometro
                </button>
              </div>
              <button
                type="button"
                onClick={() => setState((s) => ({ ...s, open: false }))}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Riduci"
              >
                <X className="size-4" />
              </button>
            </div>

            {state.mode === "pomodoro" && (
              <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                {state.phase === "work" ? (
                  <>
                    <BookOpen className="size-3.5 text-primary" /> Studio · ciclo{" "}
                    {state.cycles + 1}
                  </>
                ) : (
                  <>
                    <Coffee className="size-3.5 text-emerald-500" /> Pausa
                  </>
                )}
              </div>
            )}

            <div className="relative my-3 grid place-items-center">
              {state.mode === "pomodoro" && (
                <svg className="absolute size-32 -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    strokeWidth="5"
                    className="stroke-muted"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    strokeWidth="5"
                    strokeLinecap="round"
                    className={cn(
                      state.phase === "work" ? "stroke-primary" : "stroke-emerald-500",
                    )}
                    strokeDasharray={2 * Math.PI * 45}
                    strokeDashoffset={2 * Math.PI * 45 * (1 - progress)}
                  />
                </svg>
              )}
              <span className="py-8 font-mono text-3xl tabular-nums">{display}</span>
            </div>

            <div className="flex items-center justify-center gap-2">
              {state.running ? (
                <ControlBtn onClick={pause} label="Pausa">
                  <Pause className="size-4" />
                </ControlBtn>
              ) : (
                <ControlBtn onClick={start} label="Avvia" primary>
                  <Play className="size-4" />
                </ControlBtn>
              )}
              <ControlBtn onClick={reset} label="Azzera">
                <RotateCcw className="size-4" />
              </ControlBtn>
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="pill"
            type="button"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={() => setState((s) => ({ ...s, open: true }))}
            className="flex items-center gap-2 rounded-full border border-border/60 glass px-3.5 py-2 shadow-lg"
          >
            <span
              className={cn(
                "size-2 rounded-full",
                state.running
                  ? state.phase === "break"
                    ? "bg-emerald-500"
                    : "animate-pulse bg-primary"
                  : "bg-muted-foreground",
              )}
            />
            <span className="font-mono text-sm tabular-nums">{display}</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}

function ControlBtn({
  children,
  onClick,
  label,
  primary,
}: {
  children: React.ReactNode
  onClick: () => void
  label: string
  primary?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "grid size-10 place-items-center rounded-full transition-colors",
        primary
          ? "bg-primary text-primary-foreground hover:bg-primary/90"
          : "border border-border bg-background hover:bg-muted",
      )}
    >
      {children}
    </button>
  )
}

function formatMs(ms: number): string {
  const total = Math.floor(ms / 1000)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const pad = (n: number) => String(n).padStart(2, "0")
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}

function notify(phase: Phase) {
  try {
    const ctx = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = phase === "work" ? 660 : 440
    gain.gain.setValueAtTime(0.0001, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6)
    osc.start()
    osc.stop(ctx.currentTime + 0.6)
  } catch {
    /* ignore audio errors */
  }
}
