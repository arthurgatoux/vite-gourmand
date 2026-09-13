"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "./server"
import { getCurrentProfile } from "./get-current-profile"

export type PlatActionResult =
  | { success: true; platId?: string }
  | { success: false; error: string }

export interface DonneesPlat {
  nom: string
  description: string
  typePlat: "entree" | "plat" | "dessert"
  allergeneIds: string[]
}

async function verifierRoleEmploye() {
  const profil = await getCurrentProfile()
  if (!profil || (profil.role !== "employe" && profil.role !== "administrateur")) {
    return { autorise: false as const, error: "Action reservee aux employes et administrateurs." }
  }
  return { autorise: true as const }
}

function validerDonneesPlat(donnees: DonneesPlat): string | null {
  if (!donnees.nom.trim()) return "Le nom du plat est obligatoire."
  return null
}

export async function creerPlat(donnees: DonneesPlat): Promise<PlatActionResult> {
  const controle = await verifierRoleEmploye()
  if (!controle.autorise) return { success: false, error: controle.error }

  const erreurValidation = validerDonneesPlat(donnees)
  if (erreurValidation) return { success: false, error: erreurValidation }

  const supabase = await createClient()

  const { data: plat, error: erreurPlat } = await supabase
    .from("plats")
    .insert({
      nom: donnees.nom.trim(),
      description: donnees.description.trim() || null,
      type_plat: donnees.typePlat,
    })
    .select("id")
    .single()

  if (erreurPlat || !plat) {
    return { success: false, error: "Erreur lors de la creation du plat : " + erreurPlat?.message }
  }

  if (donnees.allergeneIds.length > 0) {
    await supabase
      .from("plat_allergene")
      .insert(donnees.allergeneIds.map(allergeneId => ({ plat_id: plat.id, allergene_id: allergeneId })))
  }

  revalidatePath("/employe/plats")

  return { success: true, platId: plat.id }
}

export async function modifierPlat(platId: string, donnees: DonneesPlat): Promise<PlatActionResult> {
  const controle = await verifierRoleEmploye()
  if (!controle.autorise) return { success: false, error: controle.error }

  const erreurValidation = validerDonneesPlat(donnees)
  if (erreurValidation) return { success: false, error: erreurValidation }

  const supabase = await createClient()

  const { error: erreurPlat } = await supabase
    .from("plats")
    .update({
      nom: donnees.nom.trim(),
      description: donnees.description.trim() || null,
      type_plat: donnees.typePlat,
    })
    .eq("id", platId)

  if (erreurPlat) {
    return { success: false, error: "Erreur lors de la modification du plat : " + erreurPlat.message }
  }

  await supabase.from("plat_allergene").delete().eq("plat_id", platId)

  if (donnees.allergeneIds.length > 0) {
    await supabase
      .from("plat_allergene")
      .insert(donnees.allergeneIds.map(allergeneId => ({ plat_id: platId, allergene_id: allergeneId })))
  }

  revalidatePath("/employe/plats")
  revalidatePath("/employe/menus")
  revalidatePath("/menus")

  return { success: true, platId }
}

export async function supprimerPlat(platId: string): Promise<PlatActionResult> {
  const controle = await verifierRoleEmploye()
  if (!controle.autorise) return { success: false, error: controle.error }

  const supabase = await createClient()

  const { count } = await supabase
    .from("menu_plat")
    .select("menu_id", { count: "exact", head: true })
    .eq("plat_id", platId)

  if (count && count > 0) {
    return {
      success: false,
      error: `Ce plat est utilise dans ${count} menu(s). Retirez-le de ces menus avant de le supprimer.`,
    }
  }

  const { error } = await supabase.from("plats").delete().eq("id", platId)

  if (error) {
    return { success: false, error: "Erreur lors de la suppression du plat : " + error.message }
  }

  revalidatePath("/employe/plats")

  return { success: true }
}
