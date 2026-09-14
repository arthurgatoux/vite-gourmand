"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "./server";
import { getCurrentProfile } from "./get-current-profile";
import { validerAvis, type DonneesAvis } from "../validations/avis";

export type DeposerAvisResult =
  | { success: true }
  | { success: false; error: string };

/**
 * CDC page 7 : "quand la commande est terminee [...] l'utilisateur est
 * notifie par mail qu'il peut se connecter a son compte pour donner son
 * avis depuis la commande. Il doit pouvoir donner une note entre 1 et 5,
 * suivi d'un commentaire."
 *
 * Deplace depuis components/mon-compte/deposer-avis.tsx (mutation directe
 * cote client) : sans cette Server Action, seule la policy RLS
 * `utilisateur_depose_avis_commande_terminee` protegeait l'ecriture, sans
 * revalidation metier (note bornee 1-5, commande bien terminee) cote
 * serveur.
 */
export async function deposerAvis(
  commandeId: string,
  donnees: DonneesAvis,
): Promise<DeposerAvisResult> {
  const profil = await getCurrentProfile();
  if (!profil) {
    return { success: false, error: "Vous devez etre connecte pour deposer un avis." };
  }

  const erreurs = validerAvis(donnees);
  if (Object.keys(erreurs).length > 0) {
    return { success: false, error: Object.values(erreurs)[0]! };
  }

  const supabase = await createClient();

  const { data: commande, error: erreurLecture } = await supabase
    .from("commandes")
    .select("utilisateurid, statutcourant")
    .eq("id", commandeId)
    .single();

  if (erreurLecture || !commande) {
    return { success: false, error: "Commande introuvable." };
  }
  if (commande.utilisateurid !== profil.id) {
    return { success: false, error: "Cette commande ne vous appartient pas." };
  }
  if (commande.statutcourant !== "termine") {
    return { success: false, error: "Vous ne pouvez deposer un avis que sur une commande terminee." };
  }

  const { error } = await supabase.from("avis").insert({
    commandeid: commandeId,
    utilisateurid: profil.id,
    note: donnees.note,
    commentaire: donnees.commentaire.trim(),
  });

  if (error) {
    return { success: false, error: "Erreur lors de l'envoi de votre avis : " + error.message };
  }

  revalidatePath(`/mon-compte/commandes/${commandeId}`);
  return { success: true };
}
