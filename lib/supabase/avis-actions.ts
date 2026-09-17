"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "./server";
import { getCurrentProfile } from "./get-current-profile";
import { validerAvis, type DonneesAvis } from "../validations/avis";

export type DeposerAvisResult =
  | { success: true }
  | { success: false; error: string };

const schemaDeposerAvis = z.object({
  note: z.number().int().min(1).max(5),
  commentaire: z.string().trim().min(1),
});

export async function deposerAvis(
  commandeId: string,
  donnees: DonneesAvis,
): Promise<DeposerAvisResult> {
  const profil = await getCurrentProfile();
  if (!profil) {
    return { success: false, error: "Vous devez être connecté pour déposer un avis." };
  }

  const validationZod = schemaDeposerAvis.safeParse(donnees);
  if (!validationZod.success) {
    return { success: false, error: "Données d'avis invalides." };
  }

  const erreurs = validerAvis(donnees);
  if (Object.keys(erreurs).length > 0) {
    return { success: false, error: Object.values(erreurs)[0]! };
  }

  const supabase = await createClient();

  const { data: commande, error: erreurLecture } = await supabase
    .from("commandes")
    .select("utilisateur_id, statut_courant")
    .eq("id", commandeId)
    .single();

  if (erreurLecture || !commande) {
    return { success: false, error: "Commande introuvable." };
  }
  if (commande.utilisateur_id !== profil.id) {
    return { success: false, error: "Cette commande ne vous appartient pas." };
  }
  if (commande.statut_courant !== "termine") {
    return { success: false, error: "Vous ne pouvez déposer un avis que sur une commande terminée." };
  }

  const { error } = await supabase.from("avis").insert({
    commande_id: commandeId,
    utilisateur_id: profil.id,
    note: donnees.note,
    commentaire: donnees.commentaire.trim(),
  });

  if (error) {
    return { success: false, error: "Erreur lors de l'envoi de votre avis : " + error.message };
  }

  revalidatePath(`/mon-compte/commandes/${commandeId}`);
  return { success: true };
}
