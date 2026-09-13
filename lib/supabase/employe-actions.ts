"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "./server";
import { getCurrentProfile } from "./get-current-profile";
import type { StatutCommande } from "./statuts-commande";
import { getProchainsStatuts } from "./statuts-transitions";
import { synchroniserStatsMenu } from "../mongodb/stats-menus";

export type ChangerStatutResult = { success: true } | { success: false; error: string };

export async function changerStatutCommande(
  commandeId: string,
  nouveauStatut: StatutCommande,
): Promise<ChangerStatutResult> {
  const profil = await getCurrentProfile();
  if (!profil || (profil.role !== "employe" && profil.role !== "administrateur")) {
    return { success: false, error: "Action reservee aux employes et administrateurs." };
  }

  const supabase = await createClient();
  const { data: commande, error: erreurLecture } = await supabase
    .from("commandes")
    .select("statut_courant, materiel_prete, prix_total, menu_id, prets_materiel(restitue), menus(titre, theme)")
    .eq("id", commandeId)
    .single();

  if (erreurLecture || !commande) {
    return { success: false, error: "Commande introuvable." };
  }

  const statutActuel = commande.statut_courant as StatutCommande;
  const statutsAutorises = getProchainsStatuts(statutActuel);
  if (!statutsAutorises.includes(nouveauStatut)) {
    return {
      success: false,
      error: `Transition de ${statutActuel} vers ${nouveauStatut} non autorisee. Les statuts se suivent dans l'ordre du processus (ou passage a annule).`,
    };
  }

  // CDC page 8 : une commande n'est terminee que si elle a ete livree sans
  // pret de materiel, ou si le materiel prete a bien ete restitue.
  if (nouveauStatut === "termine" && commande.materiel_prete) {
    const pret = Array.isArray(commande.prets_materiel) ? commande.prets_materiel[0] : commande.prets_materiel;
    if (!pret?.restitue) {
      return {
        success: false,
        error: "Le materiel prete doit etre marque comme restitue avant de clore cette commande.",
      };
    }
  }

  const { error: erreurMaj } = await supabase
    .from("commandes")
    .update({ statut_courant: nouveauStatut })
    .eq("id", commandeId);

  if (erreurMaj) {
    return { success: false, error: `Erreur lors de la mise a jour du statut : ${erreurMaj.message}` };
  }

  // CDC page 9 : synchronisation vers la base non relationnelle, uniquement
  // au passage en "termine" (docs/NoSQL-MongoDB-ViteGourmand.md, section 5).
  if (nouveauStatut === "termine") {
    const menu = Array.isArray(commande.menus) ? commande.menus[0] : commande.menus;
    if (menu) {
      await synchroniserStatsMenu({
        menuId: commande.menu_id,
        titreMenu: menu.titre,
        theme: menu.theme,
        prixTotal: Number(commande.prix_total),
        dateTerminee: new Date(),
      });
    }
  }

  revalidatePath("/employe");
  revalidatePath("/admin");

  return { success: true };
}

/**
 * Ticket E6 : Annulation de commande avec motif et mode de contact.
 * CDC page 8 : l'employe ne peut pas annuler une commande sans avoir
 * contacte le client au prealable (GSM ou mail) et sans preciser un motif.
 * La validation obligatoire est faite ici cote serveur (jamais confiance au
 * seul controle cote client), puis relayee a la fonction RPC
 * employe_annuler_commande qui ecrit motif + mode de contact dans la meme
 * transaction que le changement de statut (cf. migration 010).
 */
export async function annulerCommandeEmploye(
  commandeId: string,
  motifAnnulation: string,
  modeContactClient: string,
): Promise<ChangerStatutResult> {
  const profil = await getCurrentProfile();
  if (!profil || (profil.role !== "employe" && profil.role !== "administrateur")) {
    return { success: false, error: "Action reservee aux employes et administrateurs." };
  }

  if (!motifAnnulation.trim() || !modeContactClient.trim()) {
    return {
      success: false,
      error: "Le motif d'annulation et le mode de contact sont obligatoires avant d'annuler une commande.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("employe_annuler_commande", {
    p_commande_id: commandeId,
    p_motif: motifAnnulation.trim(),
    p_mode_contact: modeContactClient,
  });

  if (error) {
    return { success: false, error: `Erreur lors de l'annulation : ${error.message}` };
  }

  revalidatePath("/employe");
  revalidatePath("/admin");
  revalidatePath("/mon-compte/commandes");

  return { success: true };
}

export type ValiderAvisResult = { success: true } | { success: false; error: string };

/**
 * Ticket E6 : Validation ou refus des avis clients.
 * CDC : un avis n'est visible sur la page d'accueil que si statut_validation
 * passe a "valide" (RG6, deja documente dans MCD-ViteGourmand.md).
 */
export async function validerAvis(
  avisId: string,
  decision: "valide" | "refuse",
): Promise<ValiderAvisResult> {
  const profil = await getCurrentProfile();
  if (!profil || (profil.role !== "employe" && profil.role !== "administrateur")) {
    return { success: false, error: "Action reservee aux employes et administrateurs." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("avis")
    .update({ statut_validation: decision })
    .eq("id", avisId);

  if (error) {
    return { success: false, error: `Erreur lors de la mise a jour de l'avis : ${error.message}` };
  }

  revalidatePath("/employe");
  revalidatePath("/");

  return { success: true };
}

/**
 * Ticket E6 : Gestion du retour de materiel prete avec notification J+10.
 * Une fois restitue, la commande peut etre cloturee (garde-fou dans
 * changerStatutCommande ci-dessus).
 */
export async function marquerMaterielRestitue(pretMaterielId: string): Promise<ChangerStatutResult> {
  const profil = await getCurrentProfile();
  if (!profil || (profil.role !== "employe" && profil.role !== "administrateur")) {
    return { success: false, error: "Action reservee aux employes et administrateurs." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("prets_materiel")
    .update({ restitue: true })
    .eq("id", pretMaterielId);

  if (error) {
    return { success: false, error: `Erreur lors de la mise a jour du pret de materiel : ${error.message}` };
  }

  revalidatePath("/employe");

  return { success: true };
}
