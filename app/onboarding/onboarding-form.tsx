"use client"

import { useActionState } from "react"
import { motion } from "framer-motion"
import { ArrowRight, Loader2 } from "lucide-react"
import { completeOnboarding, type OnboardingState } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function OnboardingForm({ defaultName }: { defaultName?: string }) {
  const [state, formAction, pending] = useActionState<OnboardingState, FormData>(
    completeOnboarding,
    {},
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-lg rounded-3xl border border-border/60 glass p-7 shadow-glow sm:p-9"
    >
      <h1 className="text-2xl font-semibold tracking-tight">
        Benvenuto in <span className="text-gradient">mattIA</span> 👋
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Due informazioni veloci per personalizzare il tuo tutor. Potrai
        modificarle in seguito.
      </p>

      <form action={formAction} className="mt-7 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="full_name">Come ti chiami?</Label>
          <Input
            id="full_name"
            name="full_name"
            required
            defaultValue={defaultName}
            placeholder="Mario Rossi"
            autoComplete="name"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="university">Università</Label>
            <Input
              id="university"
              name="university"
              placeholder="Politecnico di Milano"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="year_of_study">Anno di corso</Label>
            <Select name="year_of_study">
              <SelectTrigger id="year_of_study">
                <SelectValue placeholder="Seleziona" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}° anno
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="degree_program">Corso di laurea</Label>
          <Input
            id="degree_program"
            name="degree_program"
            placeholder="Ingegneria Informatica"
            defaultValue="Ingegneria Informatica"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="study_goal">
            Qual è il tuo obiettivo?{" "}
            <span className="text-muted-foreground">(facoltativo)</span>
          </Label>
          <Textarea
            id="study_goal"
            name="study_goal"
            rows={3}
            placeholder="Es. superare Analisi 1 a giugno con almeno 27…"
          />
        </div>

        {state.error && (
          <p className="text-sm text-destructive">{state.error}</p>
        )}

        <Button
          type="submit"
          size="lg"
          disabled={pending}
          className="w-full shadow-glow"
        >
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Salvataggio…
            </>
          ) : (
            <>
              Inizia a studiare
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </form>
    </motion.div>
  )
}
