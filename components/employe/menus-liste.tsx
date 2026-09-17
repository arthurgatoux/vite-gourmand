"use client"

import Link from "next/link"
import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supprimerMenu } from "@/lib/supabase/menus-employe-actions"
import type { MenuEmploye } from "@/lib/supabase/menus-employe-queries"

interface MenusListeProps {
  menus: MenuEmploye[]
}

export function MenusListe({ menus: menusInitiaux }: MenusListeProps) {
  const [menus, setMenus] = useState(menusInitiaux)
  const [erreur, setErreur] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSupprimer(id: string) {
    if (!window.confirm("Supprimer définitivement ce menu ?")) return
    setErreur(null)
    startTransition(async () => {
      const resultat = await supprimerMenu(id)
      if (resultat.success) {
        setMenus(prev => prev.filter(m => m.id !== id))
      } else {
        setErreur(resultat.error)
      }
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{menus.length} menu(s)</p>
        <Button asChild size="sm">
          <Link href="/employe/menus/nouveau">Nouveau menu</Link>
        </Button>
      </div>

      {erreur && <p className="text-sm text-destructive" role="alert">{erreur}</p>}

      <ul className="grid gap-4">
        {menus.map(menu => (
          <li key={menu.id}>
            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg font-heading">{menu.titre}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {menu.prixBase.toFixed(2)} € — min. {menu.nbPersonnesMin} pers.
                    </p>
                  </div>
                  <Badge variant={menu.actif ? "default" : "outline"}>{menu.actif ? "Actif" : "Inactif"}</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Button asChild size="sm" variant="secondary">
                  <Link href={`/employe/menus/${menu.id}`}>Modifier</Link>
                </Button>
                <Button size="sm" variant="outline" disabled={isPending} onClick={() => handleSupprimer(menu.id)}>
                  Supprimer
                </Button>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  )
}
