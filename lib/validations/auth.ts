export type ChampInscription =
  | "nom"
  | "prenom"
  | "email"
  | "telephone"
  | "adressePostale"
  | "motDePasse"
  | "confirmationMotDePasse";

export type ChampConnexion = "email" | "motDePasse";

export interface DonneesInscription {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adressePostale: string;
  motDePasse: string;
  confirmationMotDePasse: string;
}

export interface DonneesConnexion {
  email: string;
  motDePasse: string;
}

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Format francais tolerant : 0X XX XX XX XX ou +33 X XX XX XX XX (espaces/points optionnels).
const REGEX_TELEPHONE = /^(\+33|0)\s*[1-9](\s*[.\-]?\s*\d{2}){4}$/;

/**
 * Regle CDC : "Mot de passe securise 10 caractere minimum constitue au minima
 * d'un caractere special, une majuscule, une minuscule, un chiffre."
 */
export function validerMotDePasse(motDePasse: string): string | null {
  if (motDePasse.length < 10) {
    return "Le mot de passe doit contenir au moins 10 caractères.";
  }
  if (!/[A-Z]/.test(motDePasse)) {
    return "Le mot de passe doit contenir au moins une majuscule.";
  }
  if (!/[a-z]/.test(motDePasse)) {
    return "Le mot de passe doit contenir au moins une minuscule.";
  }
  if (!/[0-9]/.test(motDePasse)) {
    return "Le mot de passe doit contenir au moins un chiffre.";
  }
  if (!/[^A-Za-z0-9]/.test(motDePasse)) {
    return "Le mot de passe doit contenir au moins un caractère spécial.";
  }
  return null;
}

/**
 * Validation stricte du formulaire d'inscription visiteur (CDC : nom, prenom,
 * numero de GSM, adresse mail et postale, mot de passe securise).
 */
export function validerInscription(
  donnees: DonneesInscription
): Partial<Record<ChampInscription, string>> {
  const erreurs: Partial<Record<ChampInscription, string>> = {};

  if (!donnees.nom.trim()) {
    erreurs.nom = "Le nom est obligatoire.";
  }
  if (!donnees.prenom.trim()) {
    erreurs.prenom = "Le prénom est obligatoire.";
  }
  if (!donnees.email.trim()) {
    erreurs.email = "L'adresse email est obligatoire.";
  } else if (!REGEX_EMAIL.test(donnees.email.trim())) {
    erreurs.email = "Adresse email invalide.";
  }
  if (!donnees.telephone.trim()) {
    erreurs.telephone = "Le numéro de GSM est obligatoire.";
  } else if (!REGEX_TELEPHONE.test(donnees.telephone.trim())) {
    erreurs.telephone = "Numéro de téléphone invalide (format français attendu).";
  }
  if (!donnees.adressePostale.trim()) {
    erreurs.adressePostale = "L'adresse postale est obligatoire.";
  }

  const erreurMotDePasse = validerMotDePasse(donnees.motDePasse);
  if (erreurMotDePasse) {
    erreurs.motDePasse = erreurMotDePasse;
  }
  if (donnees.motDePasse !== donnees.confirmationMotDePasse) {
    erreurs.confirmationMotDePasse = "Les mots de passe ne correspondent pas.";
  }

  return erreurs;
}

/**
 * Validation du formulaire de connexion (CDC : username = email, suivi du
 * mot de passe).
 */
export function validerConnexion(
  donnees: DonneesConnexion
): Partial<Record<ChampConnexion, string>> {
  const erreurs: Partial<Record<ChampConnexion, string>> = {};

  if (!donnees.email.trim()) {
    erreurs.email = "L'adresse email est obligatoire.";
  } else if (!REGEX_EMAIL.test(donnees.email.trim())) {
    erreurs.email = "Adresse email invalide.";
  }
  if (!donnees.motDePasse) {
    erreurs.motDePasse = "Le mot de passe est obligatoire.";
  }

  return erreurs;
}
