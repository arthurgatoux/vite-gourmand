"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "./server"
import { getCurrentProfile } from "./get-current-profile"

export type HorairesActionResult =
  | { success: true }
  | { success: false; error: string }

export interface LigneHoraire {
  jourLibelle: string
  plage: string
}

export async function remplacerHoraires(lignes: LigneHoraire[]): Promise<HorairesActionResult> {
  const profil = await getCurrentProfile()

  if (!profil || (profil.role !== "employe" && profil.role !== "administrateur")) {
    return { success: false, error: "Action réservée aux employés et administrateurs." }
  }

  const lignesValides = lignes.filter(l => l.jourLibelle.trim() && l.plage.trim())

  if (lignesValides.length === 0) {
    return { success: false, error: "Au moins une ligne d'horaire est obligatoire." }
  }

  const supabase = await createClient()

  const { error: erreurSuppression } = await supabase.from("horaires").delete().not("id", "is", null)

  if (erreurSuppression) {
    return { success: false, error: "Erreur lors de la mise à jour des horaires : " + erreurSuppression.message }
  }

  const { error: erreurInsertion } = await supabase.from("horaires").insert(
    lignesValides.map((ligne, index) => ({
      jour_libelle: ligne.jourLibelle.trim(),
      plage: ligne.plage.trim(),
      ordre: index,
    }))
  )

  if (erreurInsertion) {
    return { success: false, error: "Erreur lors de l'enregistrement des horaires : " + erreurInsertion.message }
  }

  revalidatePath("/employe/horaires")
  revalidatePath("/")

  return { success: true }
}
