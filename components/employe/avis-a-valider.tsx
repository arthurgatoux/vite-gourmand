"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { validerAvis } from "@/lib/supabase/employe-actions"
import type { AvisEmploye } from "@/lib/supabase/employe-queries"

interface AvisAValiderProps {
  avis: AvisEmploye[]
}

export function AvisAValider({ avis: avisInitial }: AvisAValiderProps) {
  const [avis, setAvis] = useState(avisInitial)
  const [isPending, startTransition] = useTransition()
  const [erreur, setErreur] = useState<string | null>(null)

  function handleDecision(avisId: string, decision: "valide" | "refuse") {
    setErreur(null)
    startTransition(async () => {
      const resultat = await validerAvis(avisId, decision)
      if (resultat.success) {
        setAvis(prev => prev.filter(a => a.id !== avisId))
      } else {
        setErreur(resultat.error)
      }
    })
  }

  if (avis.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Aucun avis en attente de validation.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {erreur && (
        <p className="text-sm text-destructive" role="alert">
          {erreur}
        </p>
      )}
      <ul className="flex flex-col gap-4">
        {avis.map(a => (
          <li key={a.id} className="rounded-2xl border border-border bg-background p-6 shadow-card">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-heading text-lg">
                  {a.prenomClient} {a.nomClient} — {a.menuTitre}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">Note : {a.note} / 5</p>
                {a.commentaire && <p className="mt-2 text-sm">{a.commentaire}</p>}
              </div>
              <div className="flex flex-shrink-0 gap-2">
                <Button size="sm" disabled={isPending} onClick={() => handleDecision(a.id, "valide")}>
                  Valider
                </Button>
                <Button size="sm" variant="outline" disabled={isPending} onClick={() => handleDecision(a.id, "refuse")}>
                  Refuser
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
