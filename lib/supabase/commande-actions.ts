"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "./server";
import { getCurrentProfile } from "./get-current-profile";
import {
  validerCommande,
  type DonneesCommande,
} from "../validations/commande";

export type CommandeActionResult =
  | { success: true; commandeId: string }
  | { success: false; error: string };

export type ModifierCommandeResult =
  | { success: true }
  | { success: false; error: string };

/**
 * CDC page 7 : creation d'une commande depuis la vue detaillee d'un menu.
 * Le prix definitif est toujours recalcule cote serveur par le trigger
 * Postgres `calculer_prix_commande` (migration 006) : cette Server Action
 * ne fait jamais confiance a un montant envoye par le client.
 *
 * Deplace depuis components/commande/commande-form.tsx (mutation directe
 * cote client) vers une Server Action, pour appliquer une regle metier qui
 * n'etait verifiee ni cote client ni en base : le delai minimum de commande
 * du menu (CDC page 4 : "necessite de commander ce menu x jours/semaines
 * avant la prestation").
 */
export async function creerCommande(
  menuId: string,
  donnees: DonneesCommande & {
    nomClient: string;
    prenomClient: string;
    emailClient: string;
    telephoneClient: string;
  },
): Promise<CommandeActionResult> {
  const profil = await getCurrentProfile();
  if (!profil) {
    return { success: false, error: "Vous devez etre connecte pour commander." };
  }

  const supabase = await createClient();

  const { data: menu, error: erreurMenu } = await supabase
    .from("menus")
    .select("nbpersonnesmin, delaicommandejours")
    .eq("id", menuId)
    .eq("actif", true)
    .single();

  if (erreurMenu || !menu) {
    return { success: false, error: "Ce menu n'est plus disponible." };
  }

  const erreurs = validerCommande(
    {
      adressePrestation: donnees.adressePrestation,
      dateprestation: donnees.dateprestation,
      heureLivraison: donnees.heureLivraison,
      nbPersonnes: donnees.nbPersonnes,
      estABordeaux: donnees.estABordeaux,
      distanceKm: donnees.distanceKm,
    },
    menu.nbpersonnesmin,
  );
  if (Object.keys(erreurs).length > 0) {
    return { success: false, error: Object.values(erreurs)[0]! };
  }

  const delaiMinimum = menu.delaicommandejours ?? 0;
  if (delaiMinimum > 0) {
    const aujourdHui = new Date();
    aujourdHui.setHours(0, 0, 0, 0);
    const datePrestation = new Date(donnees.dateprestation);
    const joursAvantPrestation = Math.floor(
      (datePrestation.getTime() - aujourdHui.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (joursAvantPrestation < delaiMinimum) {
      return {
        success: false,
        error: `Ce menu doit etre commande au moins ${delaiMinimum} jour(s) avant la date de prestation.`,
      };
    }
  }

  const { data: commande, error: erreurCommande } = await supabase
    .from("commandes")
    .insert({
      menuid: menuId,
      utilisateurid: profil.id,
      nomclient: donnees.nomClient.trim(),
      prenomclient: donnees.prenomClient.trim(),
      emailclient: donnees.emailClient.trim(),
      telephoneclient: donnees.telephoneClient.trim(),
      adresseprestation: donnees.adressePrestation.trim(),
      dateprestation: donnees.dateprestation,
      heurelivraison: donnees.heureLivraison,
      nbpersonnes: donnees.nbPersonnes,
      distancekm: donnees.estABordeaux ? 0 : donnees.distanceKm,
    })
    .select("id")
    .single();

  if (erreurCommande || !commande) {
    return { success: false, error: "Erreur lors de la creation de la commande : " + (erreurCommande?.message ?? "erreur inconnue") };
  }

  revalidatePath("/mon-compte/commandes");
  return { success: true, commandeId: commande.id };
}

/**
 * CDC page 7 : "L'annulation de commande est possible, tant qu'un employe
 * n'a pas passe la commande en accepte, la modification est egalement
 * possible : tout est modifiable, sauf le choix du menu."
 * La policy RLS `utilisateur_modifie_sa_commande_en_attente` bloque deja
 * toute tentative hors statut "en_attente" ; cette Server Action revalide
 * les regles metier avant d'ecrire, plutot que de laisser la seule RLS
 * comme garde-fou.
 */
export async function modifierCommandeUtilisateur(
  commandeId: string,
  donnees: DonneesCommande,
): Promise<ModifierCommandeResult> {
  const profil = await getCurrentProfile();
  if (!profil) {
    return { success: false, error: "Vous devez etre connecte pour modifier une commande." };
  }

  const supabase = await createClient();

  const { data: commande, error: erreurLecture } = await supabase
    .from("commandes")
    .select("utilisateurid, statutcourant, menus(nbpersonnesmin)")
    .eq("id", commandeId)
    .single();

  if (erreurLecture || !commande) {
    return { success: false, error: "Commande introuvable." };
  }
  if (commande.utilisateurid !== profil.id) {
    return { success: false, error: "Cette commande ne vous appartient pas." };
  }
  if (commande.statutcourant !== "en_attente") {
    return { success: false, error: "Cette commande ne peut plus etre modifiee." };
  }

  const menu = Array.isArray(commande.menus) ? commande.menus[0] : commande.menus;
  const erreurs = validerCommande(donnees, menu?.nbpersonnesmin ?? 1);
  if (Object.keys(erreurs).length > 0) {
    return { success: false, error: Object.values(erreurs)[0]! };
  }

  const { error: erreurMaj } = await supabase
    .from("commandes")
    .update({
      adresseprestation: donnees.adressePrestation.trim(),
      dateprestation: donnees.dateprestation,
      heurelivraison: donnees.heureLivraison,
      nbpersonnes: donnees.nbPersonnes,
      distancekm: donnees.estABordeaux ? 0 : donnees.distanceKm,
    })
    .eq("id", commandeId);

  if (erreurMaj) {
    return { success: false, error: "Erreur lors de la modification : " + erreurMaj.message };
  }

  revalidatePath(`/mon-compte/commandes/${commandeId}`);
  return { success: true };
}

/**
 * CDC page 7 : annulation par l'utilisateur, uniquement avant acceptation
 * par un employe.
 */
export async function annulerCommandeUtilisateur(
  commandeId: string,
): Promise<ModifierCommandeResult> {
  const profil = await getCurrentProfile();
  if (!profil) {
    return { success: false, error: "Vous devez etre connecte pour annuler une commande." };
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
  if (commande.statutcourant !== "en_attente") {
    return { success: false, error: "Cette commande ne peut plus etre annulee." };
  }

  const { error: erreurMaj } = await supabase
    .from("commandes")
    .update({ statutcourant: "annule" })
    .eq("id", commandeId);

  if (erreurMaj) {
    return { success: false, error: "Erreur lors de l'annulation : " + erreurMaj.message };
  }

  revalidatePath(`/mon-compte/commandes/${commandeId}`);
  return { success: true };
}
