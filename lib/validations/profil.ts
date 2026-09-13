export type ChampProfil = "nom" | "prenom" | "telephone" | "adressePostale";

export interface DonneesProfil {
  nom: string;
  prenom: string;
  telephone: string;
  adressePostale: string;
}

// Meme regle que a l'inscription (lib/validations/auth.ts) : format francais tolerant.
const REGEX_TELEPHONE = /^(\+33|0)\s*[1-9](\s*[.\-]?\s*\d{2}){4}$/;

export function validerModificationProfil(
  donnees: DonneesProfil
): Partial<Record<ChampProfil, string>> {
  const erreurs: Partial<Record<ChampProfil, string>> = {};

  if (!donnees.nom.trim()) {
    erreurs.nom = "Le nom est obligatoire.";
  }
  if (!donnees.prenom.trim()) {
    erreurs.prenom = "Le prenom est obligatoire.";
  }
  if (!donnees.telephone.trim()) {
    erreurs.telephone = "Le numero de GSM est obligatoire.";
  } else if (!REGEX_TELEPHONE.test(donnees.telephone.trim())) {
    erreurs.telephone = "Numero de telephone invalide (format francais attendu).";
  }
  if (!donnees.adressePostale.trim()) {
    erreurs.adressePostale = "L'adresse postale est obligatoire.";
  }

  return erreurs;
}
