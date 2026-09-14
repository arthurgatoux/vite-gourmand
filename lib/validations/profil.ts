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
    erreurs.prenom = "Le prénom est obligatoire.";
  }
  if (!donnees.telephone.trim()) {
    erreurs.telephone = "Le numéro de GSM est obligatoire.";
  } else if (!REGEX_TELEPHONE.test(donnees.telephone.trim())) {
    erreurs.telephone = "Numéro de téléphone invalide (format français attendu).";
  }
  if (!donnees.adressePostale.trim()) {
    erreurs.adressePostale = "L'adresse postale est obligatoire.";
  }

  return erreurs;
}
