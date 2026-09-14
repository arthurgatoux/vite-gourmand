"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "./server";
import { getCurrentProfile } from "./get-current-profile";
import { validerModificationProfil } from "../validations/profil";

export type ProfilActionResult =
  | { success: true }
  | { success: false; error: string };

export type DonneesModificationProfil = {
  nom: string;
  prenom: string;
  telephone: string;
  adressePostale: string;
};

/**
 * CDC page 7 : "un utilisateur, depuis son espace, peut [...] modifier ses
 * informations personnelles."
 *
 * Deplace depuis components/mon-compte/modifier-profil-form.tsx (mutation
 * directe cote client) : la validation des champs (regex telephone, etc.)
 * n'etait appliquee que cote navigateur et pouvait etre contournee via un
 * appel direct a l'API REST Supabase.
 */
export async function modifierProfil(
  donnees: DonneesModificationProfil,
): Promise<ProfilActionResult> {
  const profil = await getCurrentProfile();
  if (!profil) {
    return { success: false, error: "Vous devez etre connecte pour modifier votre profil." };
  }

  const erreurs = validerModificationProfil(donnees);
  if (Object.keys(erreurs).length > 0) {
    return { success: false, error: Object.values(erreurs)[0]! };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profils")
    .update({
      nom: donnees.nom.trim(),
      prenom: donnees.prenom.trim(),
      telephone: donnees.telephone.trim(),
      adressepostale: donnees.adressePostale.trim(),
    })
    .eq("id", profil.id);

  if (error) {
    return { success: false, error: "Erreur lors de la mise a jour : " + error.message };
  }

  revalidatePath("/mon-compte/profil");
  return { success: true };
}
