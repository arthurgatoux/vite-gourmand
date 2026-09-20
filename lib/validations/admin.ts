export type ChampCreationEmploye = "email" | "motDePasse";

// Règle de mot de passe fort : min 10 caractères, 1 maj, 1 min, 1 chiffre, 1 spécial
const REGEX_MOT_DE_PASSE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{10,}$/;
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validerCreationEmploye(
  email: string,
  motDePasse: string,
): Partial<Record<ChampCreationEmploye, string>> {
  const erreurs: Partial<Record<ChampCreationEmploye, string>> = {};

  if (!email.trim() || !REGEX_EMAIL.test(email.trim())) {
    erreurs.email = "Adresse email invalide.";
  }

  if (!REGEX_MOT_DE_PASSE.test(motDePasse)) {
    erreurs.motDePasse =
      "10 caractères minimum, avec une majuscule, une minuscule, un chiffre et un caractère spécial.";
  }

  return erreurs;
}
