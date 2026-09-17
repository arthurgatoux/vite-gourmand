export type StatutCommande =
  | 'en_attente'
  | 'accepte'
  | 'en_preparation'
  | 'en_livraison'
  | 'livre'
  | 'attente_retour_materiel'
  | 'termine'
  | 'annule'

export const LABEL_STATUT: Record<StatutCommande, string> = {
  en_attente: 'En attente',
  accepte: 'Accepté',
  en_preparation: 'En préparation',
  en_livraison: 'En livraison',
  livre: 'Livré',
  attente_retour_materiel: 'Attente retour matériel',
  termine: 'Terminé',
  annule: 'Annulé',
}

export const COULEUR_STATUT: Record<StatutCommande, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  en_attente: 'secondary',
  accepte: 'default',
  en_preparation: 'default',
  en_livraison: 'default',
  livre: 'default',
  attente_retour_materiel: 'outline',
  termine: 'default',
  annule: 'destructive',
}

export const ORDRE_STATUT: StatutCommande[] = [
  'en_attente',
  'accepte',
  'en_preparation',
  'en_livraison',
  'livre',
  'attente_retour_materiel',
  'termine',
  'annule',
]
