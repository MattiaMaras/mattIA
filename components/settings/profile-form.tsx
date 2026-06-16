"use client"

import * as React from "react"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { updateProfileAction } from "@/app/(app)/settings/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"

export function ProfileForm({
  fullName,
  university,
  degreeProgram,
}: {
  fullName: string
  university: string
  degreeProgram: string
}) {
  const [name, setName] = React.useState(fullName)
  const [uni, setUni] = React.useState(university)
  const [degree, setDegree] = React.useState(degreeProgram)
  const [pending, startTransition] = React.useTransition()

  const dirty =
    name !== fullName || uni !== university || degree !== degreeProgram

  function onSave() {
    startTransition(async () => {
      const res = await updateProfileAction({
        full_name: name,
        university: uni,
        degree_program: degree,
      })
      if (res.error) toast.error(res.error)
      else toast.success("Profilo aggiornato")
    })
  }

  return (
    <Card className="p-5">
      <h3 className="font-medium">Profilo</h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="p-name">Nome</Label>
          <Input
            id="p-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="p-uni">Università</Label>
          <Input
            id="p-uni"
            value={uni}
            onChange={(e) => setUni(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="p-degree">Corso di laurea</Label>
          <Input
            id="p-degree"
            value={degree}
            onChange={(e) => setDegree(e.target.value)}
          />
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <Button onClick={onSave} disabled={pending || !dirty}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : "Salva"}
        </Button>
      </div>
    </Card>
  )
}
