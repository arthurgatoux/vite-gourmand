'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { StatutBadge } from '@/components/mon-compte/statut-badge'
import { LABEL_STATUT, type StatutCommande } from '@/lib/supabase/statuts-commande'
import { type CommandeEmploye } from '@/lib/supabase/employe-queries'
import { ChangerStatutSelect } from '@/components/employe/changer-statut-select'
import { RetourMateriel } from '@/components/employe/retour-materiel'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface CommandesFiltreesProps {
  commandes: CommandeEmploye[]
}

export function CommandesFiltrees({ commandes }: CommandesFiltreesProps) {
  const [statutFiltre, setStatutFiltre] = useState<StatutCommande | 'tous'>('tous')
  const [recherche, setRecherche] = useState('')

  const commandesFiltrees = useMemo(() => {
    return commandes.filter(cmd => {
      const correspondStatut = statutFiltre === 'tous' || cmd.statutCourant === statutFiltre
      const texte = `${cmd.nomClient} ${cmd.prenomClient} ${cmd.emailClient}`.toLowerCase()
      const correspondRecherche =
        recherche.trim() === '' || texte.includes(recherche.trim().toLowerCase())
      return correspondStatut && correspondRecherche
    })
  }, [commandes, statutFiltre, recherche])

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="filtre-client">Client (nom, prénom ou email)</Label>
            <input
              id="filtre-client"
              value={recherche}
              onChange={e => setRecherche(e.target.value)}
              placeholder="Rechercher un client..."
              className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="filtre-statut">Statut</Label>
            <select
              id="filtre-statut"
              value={statutFiltre}
              onChange={e => setStatutFiltre(e.target.value as StatutCommande | 'tous')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="tous">Tous les statuts</option>
              {Object.entries(LABEL_STATUT).map(([valeur, libelle]) => (
                <option key={valeur} value={valeur}>
                  {libelle}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {commandesFiltrees.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex items-center justify-center py-12 text-center text-muted-foreground">
            Aucune commande ne correspond à ces critères.
          </CardContent>
        </Card>
      ) : (
        <ul className="grid gap-4">
          {commandesFiltrees.map(cmd => (
            <li key={cmd.id}>
              <Card className="shadow-card">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-lg font-heading">{cmd.menuTitre}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {cmd.prenomClient} {cmd.nomClient} — {cmd.emailClient}
                      </p>
                    </div>
                    <StatutBadge statut={cmd.statutCourant} />
                  </div>
                </CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <dt className="text-xs text-muted-foreground">Date</dt>
                      <dd className="font-medium">
                        {format(new Date(cmd.datePrestation), 'dd MMM yyyy', { locale: fr })}
                      </dd>
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
                  <ChangerStatutSelect commandeId={cmd.id} statutActuel={cmd.statutCourant} />
                  {cmd.pretMateriel && <RetourMateriel pret={cmd.pretMateriel} />}
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
