'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatutBadge } from './statut-badge'
import { type CommandeHistorique } from '@/lib/supabase/mon-compte-queries'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface ListeCommandesProps {
  commandes: CommandeHistorique[]
}

export function ListeCommandes({ commandes }: ListeCommandesProps) {
  if (commandes.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">
            Vous n'avez pas encore de commandes.
          </p>
          <Button asChild className="mt-4">
            <Link href="/menus">Découvrir nos menus</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <ul className="grid gap-6 sm:grid-cols-2">
      {commandes.map(cmd => (
        <li key={cmd.id}>
          <Card className="h-full shadow-card">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <CardTitle className="text-lg font-heading">{cmd.menuTitre}</CardTitle>
                <StatutBadge statut={cmd.statutCourant} />
              </div>
              {cmd.menuTheme && (
                <p className="text-xs text-muted-foreground capitalize">{cmd.menuTheme}</p>
              )}
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <dl className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">Date</dt>
                  <dd className="font-medium">
                    {format(new Date(cmd.datePrestation), 'dd MMMM yyyy', { locale: fr })}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Heure</dt>
                  <dd className="font-medium">{cmd.heureLivraison}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Personnes</dt>
                  <dd className="font-medium">{cmd.nbPersonnes}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Total</dt>
                  <dd className="font-bold text-primary">{cmd.prixTotal.toFixed(2)} €</dd>
                </div>
              </dl>
              <Button asChild variant="outline" className="mt-auto w-full">
                <Link href={`/mon-compte/commandes/${cmd.id}`}>Voir le détail</Link>
              </Button>
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  )
}
