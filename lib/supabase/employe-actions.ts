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
    return { success: false, error: "Action réservée aux employés et administrateurs." };
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
      error: `Transition de ${statutActuel} vers ${nouveauStatut} non autorisée. Les statuts se suivent dans l'ordre du processus (ou passage à annulé).`,
    };
  }

  // Garde-fou : si du matériel a été prêté, la commande ne peut pas être clôturée tant qu'il n'est pas rendu
  if (nouveauStatut === "termine" && commande.materiel_prete) {
    const pret = Array.isArray(commande.prets_materiel) ? commande.prets_materiel[0] : commande.prets_materiel;
    if (!pret?.restitue) {
      return {
        success: false,
        error: "Le matériel prêté doit être marqué comme restitué avant de clore cette commande.",
      };
    }
  }

  const { error: erreurMaj } = await supabase
    .from("commandes")
    .update({ statut_courant: nouveauStatut })
    .eq("id", commandeId);

  if (erreurMaj) {
    return { success: false, error: `Erreur lors de la mise à jour du statut : ${erreurMaj.message}` };
  }

  // Synchro NoSQL : mise à jour des statistiques de vente dans MongoDB Atlas quand la commande est terminée
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

// Annulation d'une commande côté employé avec obligation de préciser le motif et le moyen de contact
export async function annulerCommandeEmploye(
  commandeId: string,
  motifAnnulation: string,
  modeContactClient: string,
): Promise<ChangerStatutResult> {
  const profil = await getCurrentProfile();
  if (!profil || (profil.role !== "employe" && profil.role !== "administrateur")) {
    return { success: false, error: "Action réservée aux employés et administrateurs." };
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

// Validation ou refus d'un avis client (seuls les avis validés apparaissent sur la home)
export async function validerAvis(
  avisId: string,
  decision: "valide" | "refuse",
): Promise<ValiderAvisResult> {
  const profil = await getCurrentProfile();
  if (!profil || (profil.role !== "employe" && profil.role !== "administrateur")) {
    return { success: false, error: "Action réservée aux employés et administrateurs." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("avis")
    .update({ statut_validation: decision })
    .eq("id", avisId);

  if (error) {
    return { success: false, error: `Erreur lors de la mise à jour de l'avis : ${error.message}` };
  }

  revalidatePath("/employe");
  revalidatePath("/");

  return { success: true };
}

// Marquer le matériel prêté comme restitué par le client
export async function marquerMaterielRestitue(pretMaterielId: string): Promise<ChangerStatutResult> {
  const profil = await getCurrentProfile();
  if (!profil || (profil.role !== "employe" && profil.role !== "administrateur")) {
    return { success: false, error: "Action réservée aux employés et administrateurs." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("prets_materiel")
    .update({ restitue: true })
    .eq("id", pretMaterielId);

  if (error) {
    return { success: false, error: `Erreur lors de la mise à jour du prêt de matériel : ${error.message}` };
  }

  revalidatePath("/employe");

  return { success: true };
}
