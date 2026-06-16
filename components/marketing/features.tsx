"use client"

import { motion } from "framer-motion"
import {
  BrainCircuit,
  FileText,
  Layers,
  PenLine,
  Presentation,
  Repeat,
  Timer,
  Sparkles,
} from "lucide-react"

const features = [
  {
    icon: BrainCircuit,
    title: "Tutor AI con RAG",
    desc: "Un professore virtuale che risponde basandosi sui tuoi PDF e dispense, con Markdown e formule LaTeX rese alla perfezione.",
  },
  {
    icon: Layers,
    title: "Multi-AI · Bring Your Own Key",
    desc: "Usa Anthropic, OpenAI o Google con le tue chiavi. Cambia modello al volo nella stessa sessione.",
  },
  {
    icon: FileText,
    title: "Sessioni di studio",
    desc: "Organizza ogni materia in una sessione: materiali, tracce d'esame, chat, appunti e progressi sempre separati.",
  },
  {
    icon: Timer,
    title: "Simulatore d'esame",
    desc: "Genera simulazioni dalle vecchie tracce con timer Pomodoro integrato che non disturba la concentrazione.",
  },
  {
    icon: Repeat,
    title: "Flashcard & ripetizione",
    desc: "Flashcard in stile Anki generate dai tuoi appunti, con ripetizione dilazionata per fissare i concetti.",
  },
  {
    icon: PenLine,
    title: "Taccuini & editor",
    desc: "Appunti persistenti in Markdown con toolbar LaTeX ed export PDF. Tanti taccuini per ogni sessione.",
  },
  {
    icon: Presentation,
    title: "Lavagna digitale",
    desc: "Disegna e schematizza con supporto Apple Pencil, pressione e palm rejection, ottimizzata per iPad.",
  },
  {
    icon: Sparkles,
    title: "Dashboard & glossario",
    desc: "Radar della padronanza per argomento e un glossario smart con definizioni al passaggio del mouse.",
  },
]

export function Features() {
  return (
    <section id="features" className="relative mx-auto w-[min(1100px,92%)] py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Tutto ciò che serve per superare l&apos;esame
        </h2>
        <p className="mt-4 text-muted-foreground">
          Un workspace unico, pensato per la concentrazione e costruito attorno
          ai tuoi materiali.
        </p>
      </div>

      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.45, delay: (i % 4) * 0.06, ease: "easeOut" }}
            className="group rounded-2xl border border-border/60 bg-card/50 p-5 transition-colors hover:border-primary/40 hover:bg-card"
          >
            <div className="mb-4 grid size-11 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <f.icon className="size-5.5" />
            </div>
            <h3 className="font-medium">{f.title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
