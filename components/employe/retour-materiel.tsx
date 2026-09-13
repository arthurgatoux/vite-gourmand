"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { marquerMaterielRestitue } from "@/lib/supabase/employe-actions"
import type { PretMaterielCommande } from "@/lib/supabase/employe-queries"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface RetourMaterielProps {
  pret: PretMaterielCommande
}

export function RetourMateriel({ pret: pretInitial }: RetourMaterielProps) {
  const [pret, setPret] = useState(pretInitial)
  const [isPending, startTransition] = useTransition()
  const [erreur, setErreur] = useState<string | null>(null)

  function handleRestitution() {
    setErreur(null)
    startTransition(async () => {
      const resultat = await marquerMaterielRestitue(pret.id)
      if (resultat.success) {
        setPret(prev => ({ ...prev, restitue: true }))
      } else {
        setErreur(resultat.error)
      }
    })
  }

  if (pret.restitue) {
    return <p className="mt-3 text-xs font-medium text-green-600">Matériel restitué.</p>
  }

  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border-2 border-accent bg-secondary p-3">
      <div className="text-xs">
        <p className="font-bold text-foreground">Matériel prêté — en attente de restitution.</p>
        <p className="mt-0.5 text-muted-foreground">
          Retour attendu avant le {format(new Date(pret.dateLimiteRetour), "dd MMMM yyyy", { locale: fr })}
          {pret.fraisAppliques && " — frais de 600 € appliqués (retard)."}
        </p>
        {erreur && <p className="mt-1 text-destructive">{erreur}</p>}
      </div>
      <Button size="sm" variant="outline" disabled={isPending} onClick={handleRestitution}>
        {isPending ? "Mise a jour..." : "Marquer comme restitué"}
      </Button>
    </div>
  )
}
