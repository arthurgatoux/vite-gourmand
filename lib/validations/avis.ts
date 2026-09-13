export type ChampAvis = "note" | "commentaire";

export interface DonneesAvis {
  note: number;
  commentaire: string;
}

export function validerAvis(donnees: DonneesAvis): Partial<Record<ChampAvis, string>> {
  const erreurs: Partial<Record<ChampAvis, string>> = {};

  if (!Number.isInteger(donnees.note) || donnees.note < 1 || donnees.note > 5) {
    erreurs.note = "La note doit être comprise entre 1 et 5.";
  }
  if (!donnees.commentaire.trim()) {
    erreurs.commentaire = "Le commentaire est obligatoire.";
  }

  return erreurs;
}
