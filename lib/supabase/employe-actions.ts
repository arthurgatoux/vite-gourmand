"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "./server"
import { getCurrentProfile } from "./get-current-profile"
import type { StatutCommande } from "./statuts-commande"
import { getProchainsStatuts } from "./statuts-transitions"

export type ChangerStatutResult =
  | { success: true }
  | { success: false; error: string }

export async function changerStatutCommande(
  commandeId: string,
  nouveauStatut: StatutCommande
): Promise<ChangerStatutResult> {
  const profil = await getCurrentProfile()

  if (!profil || (profil.role !== "employe" && profil.role !== "administrateur")) {
    return { success: false, error: "Action reservee aux employes et administrateurs." }
  }

  const supabase = await createClient()

  const { data: commande, error: erreurLecture } = await supabase
    .from("commandes")
    .select("statut_courant")
    .eq("id", commandeId)
    .single()

  if (erreurLecture || !commande) {
    return { success: false, error: "Commande introuvable." }
  }

  const statutActuel = commande.statut_courant as StatutCommande
  const statutsAutorises = getProchainsStatuts(statutActuel)

  if (!statutsAutorises.includes(nouveauStatut)) {
    return {
      success: false,
      error: `Transition de "${statutActuel}" vers "${nouveauStatut}" non autorisee. Les statuts se suivent dans l'ordre du processus (ou passage a "annule").`,
    }
  }

  const { error: erreurMaj } = await supabase
    .from("commandes")
    .update({ statut_courant: nouveauStatut })
    .eq("id", commandeId)

  if (erreurMaj) {
    return { success: false, error: "Erreur lors de la mise a jour du statut : " + erreurMaj.message }
  }

  revalidatePath("/employe")
  revalidatePath("/admin")

  return { success: true }
}

// Ticket E6 : Annulation de commande avec motif et mode de contact.
// CDC (page 8) : l'employe ne peut pas annuler une commande sans avoir
// contacte le client au prealable (GSM ou mail) et sans preciser un motif.
// La validation obligatoire est faite ici cote serveur (jamais confiance
// au seul controle cote client), puis relayee a la fonction RPC
// employe_annuler_commande qui ecrit motif + mode de contact dans la meme
// transaction que le changement de statut (cf. migration 010).
export async function annulerCommandeEmploye(
  commandeId: string,
  motifAnnulation: string,
  modeContactClient: string
): Promise<ChangerStatutResult> {
  const profil = await getCurrentProfile()

  if (!profil || (profil.role !== "employe" && profil.role !== "administrateur")) {
    return { success: false, error: "Action reservee aux employes et administrateurs." }
  }

  if (!motifAnnulation.trim() || !modeContactClient.trim()) {
    return {
      success: false,
      error: "Le motif d'annulation et le mode de contact sont obligatoires avant d'annuler une commande.",
    }
  }

  const supabase = await createClient()

  const { error } = await supabase.rpc("employe_annuler_commande", {
    p_commande_id: commandeId,
    p_motif: motifAnnulation.trim(),
    p_mode_contact: modeContactClient,
  })

  if (error) {
    return { success: false, error: "Erreur lors de l'annulation : " + error.message }
  }

  revalidatePath("/employe")
  revalidatePath("/admin")
  revalidatePath("/mon-compte/commandes")

  return { success: true }
}
