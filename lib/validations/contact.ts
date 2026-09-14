export type ChampContact = "titre" | "description" | "email";

export interface DonneesContact {
  titre: string;
  description: string;
  email: string;
}

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validation du formulaire de contact (CDC : "un formulaire qui va lui demander
 * un titre, une description ainsi que son mail afin qu'il puisse obtenir une reponse").
 */
export function validerContact(
  donnees: DonneesContact
): Partial<Record<ChampContact, string>> {
  const erreurs: Partial<Record<ChampContact, string>> = {};

  if (!donnees.titre.trim()) {
    erreurs.titre = "Le titre est obligatoire.";
  } else if (donnees.titre.trim().length > 150) {
    erreurs.titre = "Le titre ne doit pas dépasser 150 caractères.";
  }

  if (!donnees.description.trim()) {
    erreurs.description = "Le message est obligatoire.";
  } else if (donnees.description.trim().length < 10) {
    erreurs.description = "Le message doit contenir au moins 10 caractères.";
  }

  if (!donnees.email.trim()) {
    erreurs.email = "L'adresse email est obligatoire.";
  } else if (!REGEX_EMAIL.test(donnees.email.trim())) {
    erreurs.email = "Adresse email invalide.";
  }

  return erreurs;
}
