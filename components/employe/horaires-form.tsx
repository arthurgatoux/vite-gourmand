"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { remplacerHoraires, type LigneHoraire } from "@/lib/supabase/horaires-employe-actions"
import type { HoraireEmploye } from "@/lib/supabase/horaires-employe-queries"

interface HorairesFormProps {
  horaires: HoraireEmploye[]
}

export function HorairesForm({ horaires: horairesInitiaux }: HorairesFormProps) {
  const [lignes, setLignes] = useState<LigneHoraire[]>(
    horairesInitiaux.map(h => ({ jourLibelle: h.jourLibelle, plage: h.plage }))
  )
  const [message, setMessage] = useState<{ type: "success" | "error"; texte: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    startTransition(async () => {
      const resultat = await remplacerHoraires(lignes)
      if (resultat.success) {
        setMessage({ type: "success", texte: "Horaires mis a jour." })
      } else {
        setMessage({ type: "error", texte: resultat.error })
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 rounded-2xl border border-border bg-background p-8 shadow-card">
      <div className="flex flex-col gap-4">
        {lignes.map((ligne, index) => (
          <div key={index} className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor={`jour-${index}`}>Jour(s)</Label>
              <Input
                id={`jour-${index}`}
                placeholder="Lundi - Vendredi"
                value={ligne.jourLibelle}
                onChange={e => setLignes(prev => prev.map((l, i) => (i === index ? { ...l, jourLibelle: e.target.value } : l)))}
              />
            </div>
            <div className="flex gap-2">
              <div className="grid flex-1 gap-2">
                <Label htmlFor={`plage-${index}`}>Horaire</Label>
                <Input
                  id={`plage-${index}`}
                  placeholder="9h - 19h ou Sur rendez-vous"
                  value={ligne.plage}
                  onChange={e => setLignes(prev => prev.map((l, i) => (i === index ? { ...l, plage: e.target.value } : l)))}
                />
              </div>
              <Button type="button" variant="outline" size="sm" className="mt-auto" onClick={() => setLignes(prev => prev.filter((_, i) => i !== index))}>
                Retirer
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Button type="button" variant="outline" size="sm" onClick={() => setLignes(prev => [...prev, { jourLibelle: "", plage: "" }])}>
        Ajouter une ligne
      </Button>

      {message && (
        <p className={message.type === "success" ? "text-sm text-green-600" : "text-sm text-destructive"} role={message.type === "error" ? "alert" : undefined}>
          {message.texte}
        </p>
      )}

      <Button type="submit" size="lg" disabled={isPending}>
        {isPending ? "Enregistrement..." : "Enregistrer les horaires"}
      </Button>
    </form>
  )
}
