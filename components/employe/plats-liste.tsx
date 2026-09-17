"use client"

import Link from "next/link"
import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supprimerPlat } from "@/lib/supabase/plats-employe-actions"
import type { PlatEmploye } from "@/lib/supabase/plats-employe-queries"

const LABEL_TYPE_PLAT: Record<string, string> = { entree: "Entrée", plat: "Plat", dessert: "Dessert" }

interface PlatsListeProps {
  plats: PlatEmploye[]
}

export function PlatsListe({ plats: platsInitiaux }: PlatsListeProps) {
  const [plats, setPlats] = useState(platsInitiaux)
  const [erreur, setErreur] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSupprimer(id: string) {
    if (!window.confirm("Supprimer définitivement ce plat ?")) return
    setErreur(null)
    startTransition(async () => {
      const resultat = await supprimerPlat(id)
      if (resultat.success) {
        setPlats(prev => prev.filter(p => p.id !== id))
      } else {
        setErreur(resultat.error)
      }
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{plats.length} plat(s)</p>
        <Button asChild size="sm">
          <Link href="/employe/plats/nouveau">Nouveau plat</Link>
        </Button>
      </div>

      {erreur && <p className="text-sm text-destructive" role="alert">{erreur}</p>}

      <ul className="grid gap-3 sm:grid-cols-2">
        {plats.map(plat => (
          <li key={plat.id}>
            <Card className="shadow-card">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base font-heading">{plat.nom}</CardTitle>
                  <Badge variant="outline">{LABEL_TYPE_PLAT[plat.typePlat]}</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <p className="text-xs text-muted-foreground">
                  Utilisé dans {plat.nombreMenus} menu(s)
                </p>
                <div className="flex gap-2">
                  <Button asChild size="sm" variant="secondary">
                    <Link href={`/employe/plats/${plat.id}`}>Modifier</Link>
                  </Button>
                  <Button size="sm" variant="outline" disabled={isPending} onClick={() => handleSupprimer(plat.id)}>
                    Supprimer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  )
}
