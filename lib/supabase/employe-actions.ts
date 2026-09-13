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
