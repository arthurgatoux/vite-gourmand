"use server";

import { z } from "zod";
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

const schemaModificationProfil = z.object({
  nom: z.string().trim().min(1),
  prenom: z.string().trim().min(1),
  telephone: z.string().trim().min(1),
  adressePostale: z.string().trim().min(1),
});

export async function modifierProfil(
  donnees: DonneesModificationProfil,
): Promise<ProfilActionResult> {
  const profil = await getCurrentProfile();
  if (!profil) {
    return { success: false, error: "Vous devez etre connecte pour modifier votre profil." };
  }

  const validationZod = schemaModificationProfil.safeParse(donnees);
  if (!validationZod.success) {
    return { success: false, error: "Donnees de profil invalides." };
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
