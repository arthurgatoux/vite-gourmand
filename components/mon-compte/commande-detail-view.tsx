import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatutBadge } from './statut-badge'
import { type CommandeDetail } from '@/lib/supabase/mon-compte-queries'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { LABEL_STATUT } from '@/lib/supabase/statuts-commande'

interface CommandeDetailViewProps {
  commande: CommandeDetail
}

export function CommandeDetailView({ commande }: CommandeDetailViewProps) {
  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="text-2xl font-heading">{commande.menuTitre}</CardTitle>
                {commande.menuTheme && (
                  <p className="mt-1 text-sm text-muted-foreground capitalize">
                    {commande.menuTheme}
                  </p>
                )}
              </div>
              <StatutBadge statut={commande.statutCourant} className="text-sm" />
            </div>
          </CardHeader>
          <CardContent className="grid gap-6">
            <section>
              <h3 className="mb-3 text-sm font-bold uppercase tracking-widest text-primary">
                Détails de la prestation
              </h3>
              <dl className="grid gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-muted-foreground">Client</dt>
                  <dd className="font-medium">
                    {commande.prenomClient} {commande.nomClient}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Email</dt>
                  <dd className="font-medium">{commande.emailClient}</dd>
                </div>
                {commande.telephoneClient && (
                  <div>
                    <dt className="text-xs text-muted-foreground">Téléphone</dt>
                    <dd className="font-medium">{commande.telephoneClient}</dd>
                  </div>
                )}
                <div className="sm:col-span-2">
                  <dt className="text-xs text-muted-foreground">Adresse</dt>
                  <dd className="font-medium">{commande.adressePrestation}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Date</dt>
                  <dd className="font-medium">
                    {format(new Date(commande.datePrestation), 'dd MMMM yyyy', { locale: fr })}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Heure</dt>
                  <dd className="font-medium">{commande.heureLivraison}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Personnes</dt>
                  <dd className="font-medium">{commande.nbPersonnes}</dd>
                </div>
                {commande.distanceKm !== null && (
                  <div>
                    <dt className="text-xs text-muted-foreground">Distance</dt>
                    <dd className="font-medium">{commande.distanceKm} km</dd>
                  </div>
                )}
              </dl>
            </section>

            <section>
              <h3 className="mb-3 text-sm font-bold uppercase tracking-widest text-primary">
                Récapitulatif financier
              </h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Prix menu</dt>
                  <dd className="font-medium">{commande.prixMenu.toFixed(2)} €</dd>
                </div>
                {commande.reductionPourcentage > 0 && (
                  <div className="flex justify-between text-green-600">
                    <dt>Réduction appliquée</dt>
                    <dd className="font-medium">−{commande.reductionPourcentage}%</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Livraison</dt>
                  <dd className="font-medium">{commande.prixLivraison.toFixed(2)} €</dd>
                </div>
                <div className="flex justify-between border-t pt-2 text-base font-bold">
                  <dt>Total payé</dt>
                  <dd className="text-primary">{commande.prixTotal.toFixed(2)} €</dd>
                </div>
              </dl>
            </section>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg font-heading">Suivi de la commande</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="relative border-l border-border pl-4">
              {commande.historique.map((étape, index) => (
                <li key={étape.id} className="mb-6 ml-2">
                  <div className="flex items-center gap-2">
                    <StatutBadge statut={étape.statut as any} />
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(étape.dateChangement), 'dd/MM/yyyy HH:mm', { locale: fr })}
                    </span>
                  </div>
                  {étape.motifAnnulation && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Motif : {étape.motifAnnulation}
                      {étape.modeContactClient && ` (contact : ${étape.modeContactClient})`}
                    </p>
                  )}
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        {commande.materielPrete && (
          <Card className="border-2 border-accent bg-secondary shadow-card">
            <CardContent className="py-6">
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">
                  Matériel prêté
                </Badge>
                <div>
                  <p className="text-sm font-medium">
                    Du matériel a été prêté pour cette commande.
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    En cas de non-restitution sous 10 jours ouvrés, des frais de 600 € pourront
                    s'appliquer (voir CGV).
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
