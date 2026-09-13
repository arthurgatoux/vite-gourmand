export type ChampCommande =
  | "adressePrestation"
  | "dateprestation"
  | "heureLivraison"
  | "nbPersonnes"
  | "distanceKm";

export interface DonneesCommande {
  adressePrestation: string;
  dateprestation: string;
  heureLivraison: string;
  nbPersonnes: number;
  estABordeaux: boolean;
  distanceKm: number;
}

/**
 * Validation du formulaire de commande.
 * CDC : "il y a l'obligation de commander pour le nombre minimum de personne
 * inscrit dans le menu." Le controle definitif est refait cote serveur
 * (trigger calculer_prix_commande) : cette validation est une aide UX, pas
 * la source de verite.
 */
export function validerCommande(
  donnees: DonneesCommande,
  nbPersonnesMin: number
): Partial<Record<ChampCommande, string>> {
  const erreurs: Partial<Record<ChampCommande, string>> = {};

  if (!donnees.adressePrestation.trim()) {
    erreurs.adressePrestation = "L'adresse de prestation est obligatoire.";
  }

  if (!donnees.dateprestation) {
    erreurs.dateprestation = "La date de prestation est obligatoire.";
  } else if (new Date(donnees.dateprestation) < new Date(new Date().toDateString())) {
    erreurs.dateprestation = "La date de prestation ne peut pas etre dans le passe.";
  }

  if (!donnees.heureLivraison) {
    erreurs.heureLivraison = "L'heure de livraison est obligatoire.";
  }

  if (!donnees.nbPersonnes || donnees.nbPersonnes < nbPersonnesMin) {
    erreurs.nbPersonnes = `Le nombre de personnes minimum pour ce menu est ${nbPersonnesMin}.`;
  }

  if (!donnees.estABordeaux && (!donnees.distanceKm || donnees.distanceKm <= 0)) {
    erreurs.distanceKm = "Indiquez la distance depuis Bordeaux en kilometres.";
  }

  return erreurs;
}

/**
 * Reproduit cote client le calcul serveur (RG2 reduction, RG3 livraison)
 * uniquement pour l'apercu avant validation exige par le CDC. Le montant qui
 * fait foi est toujours celui recalcule par le trigger Supabase.
 */
export function calculerApercuPrix(
  prixBase: number,
  nbPersonnes: number,
  nbPersonnesMin: number,
  estABordeaux: boolean,
  distanceKm: number
) {
  const reductionPourcentage = nbPersonnes >= nbPersonnesMin + 5 ? 10 : 0;
  const prixMenu = prixBase * nbPersonnes * (1 - reductionPourcentage / 100);
  const prixLivraison = estABordeaux ? 5 : 5 + Math.max(distanceKm, 0) * 0.59;
  const prixTotal = prixMenu + prixLivraison;

  return { reductionPourcentage, prixMenu, prixLivraison, prixTotal };
}
