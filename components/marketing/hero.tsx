"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

const fade = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: 0.08 * i, ease: "easeOut" as const },
  }),
}

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-aurora" />
      <div className="pointer-events-none absolute inset-0 bg-grid [mask-image:radial-gradient(70%_60%_at_50%_30%,black,transparent)]" />

      <div className="relative mx-auto flex w-[min(1100px,92%)] flex-col items-center pt-24 pb-20 text-center md:pt-32">
        <motion.div
          variants={fade}
          custom={0}
          initial="hidden"
          animate="show"
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 glass px-3.5 py-1.5 text-sm text-muted-foreground"
        >
          <Sparkles className="size-4 text-primary" />
          Il tuo professore AI per Ingegneria Informatica
        </motion.div>

        <motion.h1
          variants={fade}
          custom={1}
          initial="hidden"
          animate="show"
          className="max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-6xl"
        >
          Studia più intelligente,
          <br />
          non più a lungo con{" "}
          <span className="text-gradient">mattIA</span>
        </motion.h1>

        <motion.p
          variants={fade}
          custom={2}
          initial="hidden"
          animate="show"
          className="mt-6 max-w-2xl text-pretty text-lg text-muted-foreground"
        >
          Carica dispense ed esami passati, crea le tue sessioni di studio e
          chatta con un tutor AI che risponde basandosi sui{" "}
          <span className="text-foreground">tuoi materiali</span>. Simulazioni
          d&apos;esame, flashcard, appunti e lavagna — tutto in un posto.
        </motion.p>

        <motion.div
          variants={fade}
          custom={3}
          initial="hidden"
          animate="show"
          className="mt-9 flex flex-col items-center gap-3 sm:flex-row"
        >
          <Button
            size="lg"
            className="h-12 px-7 text-base shadow-glow"
            render={<Link href="/sign-up" />}
          >
            Inizia gratis
            <ArrowRight className="size-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-12 px-7 text-base"
            render={<Link href="/sign-in" />}
          >
            Ho già un account
          </Button>
        </motion.div>

        <motion.p
          variants={fade}
          custom={4}
          initial="hidden"
          animate="show"
          className="mt-5 text-sm text-muted-foreground"
        >
          Porta le tue chiavi AI (Anthropic, OpenAI, Google) — nessun costo
          nascosto.
        </motion.p>

        {/* Floating app preview */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.5, ease: "easeOut" }}
          className="mt-16 w-full max-w-4xl"
        >
          <div className="rounded-2xl border border-border/60 glass p-2 shadow-2xl">
            <div className="rounded-xl border border-border/60 bg-card/60 p-6 text-left">
              <div className="mb-4 flex items-center gap-1.5">
                <span className="size-3 rounded-full bg-destructive/70" />
                <span className="size-3 rounded-full bg-chart-5/70" />
                <span className="size-3 rounded-full bg-chart-4/70" />
                <span className="ml-3 text-xs text-muted-foreground">
                  mattIA · Analisi 1
                </span>
              </div>
              <div className="space-y-3 text-sm">
                <div className="ml-auto w-fit max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-primary-foreground">
                  Spiegami il teorema di Lagrange con un esempio.
                </div>
                <div className="w-fit max-w-[85%] rounded-2xl rounded-bl-sm bg-muted px-4 py-2.5">
                  Certo. Il <em>teorema del valor medio</em> di Lagrange afferma
                  che se <span className="font-mono text-primary">f</span> è
                  continua su <span className="font-mono text-primary">[a,b]</span>{" "}
                  e derivabile su <span className="font-mono text-primary">(a,b)</span>
                  , allora esiste{" "}
                  <span className="font-mono text-primary">c ∈ (a,b)</span> tale
                  che f′(c) = (f(b)−f(a))/(b−a). 📚
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
