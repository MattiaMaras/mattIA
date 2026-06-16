"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, FolderPlus, Upload, MessagesSquare } from "lucide-react"
import { Button } from "@/components/ui/button"

const steps = [
  {
    icon: FolderPlus,
    step: "01",
    title: "Crea una sessione",
    desc: "Una per ogni materia — Analisi 1, Reti Logiche, Fisica… con il suo contesto isolato.",
  },
  {
    icon: Upload,
    step: "02",
    title: "Carica i materiali",
    desc: "PDF, dispense e tracce d'esame. mattIA li indicizza per rispondere con precisione.",
  },
  {
    icon: MessagesSquare,
    step: "03",
    title: "Studia con il tutor",
    desc: "Chatta, simula esami, prendi appunti e ripassa con le flashcard. Tutto persistente.",
  },
]

export function HowItWorks() {
  return (
    <section id="how" className="relative border-t border-border/60 bg-muted/30">
      <div className="mx-auto w-[min(1100px,92%)] py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Tre passi e sei pronto
          </h2>
          <p className="mt-4 text-muted-foreground">
            Dalla prima dispensa alla simulazione d&apos;esame in pochi minuti.
          </p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {steps.map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: i * 0.1, ease: "easeOut" }}
              className="relative rounded-2xl border border-border/60 bg-card p-6"
            >
              <span className="text-sm font-mono text-primary/70">{s.step}</span>
              <div className="my-4 grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                <s.icon className="size-5.5" />
              </div>
              <h3 className="font-medium">{s.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{s.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative mt-16 overflow-hidden rounded-3xl border border-border/60 bg-aurora p-10 text-center md:p-16"
        >
          <h3 className="mx-auto max-w-xl text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            Pronto a trasformare il tuo modo di studiare?
          </h3>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            Inizia gratis con le tue chiavi AI. Bastano due minuti.
          </p>
          <Button
            size="lg"
            className="mt-7 h-12 px-7 text-base shadow-glow"
            render={<Link href="/sign-up" />}
          >
            Crea il tuo account
            <ArrowRight className="size-4" />
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
