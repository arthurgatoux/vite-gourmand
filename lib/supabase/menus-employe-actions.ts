"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "./server"
import { getCurrentProfile } from "./get-current-profile"

export type MenuActionResult =
  | { success: true; menuId?: string }
  | { success: false; error: string }

export interface DonneesMenu {
  titre: string
  description: string
  theme: string
  prixBase: number
  nbPersonnesMin: number
  conditions: string
  delaiCommandeJours: number
  stockDisponible: number
  actif: boolean
  images: string[]
  platIds: string[]
  regimeIds: string[]
}

async function verifierRoleEmploye() {
  const profil = await getCurrentProfile()
  if (!profil || (profil.role !== "employe" && profil.role !== "administrateur")) {
    return { autorise: false as const, error: "Action reservee aux employes et administrateurs." }
  }
  return { autorise: true as const }
}

function validerDonneesMenu(donnees: DonneesMenu): string | null {
  if (!donnees.titre.trim()) return "Le titre du menu est obligatoire."
  if (donnees.prixBase <= 0) return "Le prix doit etre superieur a 0."
  if (donnees.nbPersonnesMin <= 0) return "Le nombre de personnes minimum doit etre superieur a 0."
  return null
}

export async function creerMenu(donnees: DonneesMenu): Promise<MenuActionResult> {
  const controle = await verifierRoleEmploye()
  if (!controle.autorise) return { success: false, error: controle.error }

  const erreurValidation = validerDonneesMenu(donnees)
  if (erreurValidation) return { success: false, error: erreurValidation }

  const supabase = await createClient()

  const { data: menu, error: erreurMenu } = await supabase
    .from("menus")
    .insert({
      titre: donnees.titre.trim(),
      description: donnees.description.trim() || null,
      theme: donnees.theme.trim() || null,
      prix_base: donnees.prixBase,
      nb_personnes_min: donnees.nbPersonnesMin,
      conditions: donnees.conditions.trim() || null,
      delai_commande_jours: donnees.delaiCommandeJours,
      stock_disponible: donnees.stockDisponible,
      actif: donnees.actif,
    })
    .select("id")
    .single()

  if (erreurMenu || !menu) {
    return { success: false, error: "Erreur lors de la creation du menu : " + erreurMenu?.message }
  }

  await enregistrerAssociationsMenu(supabase, menu.id, donnees)

  revalidatePath("/employe/menus")
  revalidatePath("/menus")

  return { success: true, menuId: menu.id }
}

export async function modifierMenu(menuId: string, donnees: DonneesMenu): Promise<MenuActionResult> {
  const controle = await verifierRoleEmploye()
  if (!controle.autorise) return { success: false, error: controle.error }

  const erreurValidation = validerDonneesMenu(donnees)
  if (erreurValidation) return { success: false, error: erreurValidation }

  const supabase = await createClient()

  const { error: erreurMenu } = await supabase
    .from("menus")
    .update({
      titre: donnees.titre.trim(),
      description: donnees.description.trim() || null,
      theme: donnees.theme.trim() || null,
      prix_base: donnees.prixBase,
      nb_personnes_min: donnees.nbPersonnesMin,
      conditions: donnees.conditions.trim() || null,
      delai_commande_jours: donnees.delaiCommandeJours,
      stock_disponible: donnees.stockDisponible,
      actif: donnees.actif,
    })
    .eq("id", menuId)

  if (erreurMenu) {
    return { success: false, error: "Erreur lors de la modification du menu : " + erreurMenu.message }
  }

  await supabase.from("menu_images").delete().eq("menu_id", menuId)
  await supabase.from("menu_plat").delete().eq("menu_id", menuId)
  await supabase.from("menu_regime").delete().eq("menu_id", menuId)

  await enregistrerAssociationsMenu(supabase, menuId, donnees)

  revalidatePath("/employe/menus")
  revalidatePath("/menus")
  revalidatePath(`/menus/${menuId}`)

  return { success: true, menuId }
}

async function enregistrerAssociationsMenu(
  supabase: Awaited<ReturnType<typeof createClient>>,
  menuId: string,
  donnees: DonneesMenu
) {
  const images = donnees.images.filter(url => url.trim() !== "")
  if (images.length > 0) {
    await supabase.from("menu_images").insert(
      images.map((url, index) => ({ menu_id: menuId, url: url.trim(), ordre: index }))
    )
  }

  if (donnees.platIds.length > 0) {
    await supabase.from("menu_plat").insert(donnees.platIds.map(platId => ({ menu_id: menuId, plat_id: platId })))
  }

  if (donnees.regimeIds.length > 0) {
    await supabase
      .from("menu_regime")
      .insert(donnees.regimeIds.map(regimeId => ({ menu_id: menuId, regime_id: regimeId })))
  }
}

export async function supprimerMenu(menuId: string): Promise<MenuActionResult> {
  const controle = await verifierRoleEmploye()
  if (!controle.autorise) return { success: false, error: controle.error }

  const supabase = await createClient()

  const { error } = await supabase.from("menus").delete().eq("id", menuId)

  if (error) {
    if (error.code === "23503") {
      return {
        success: false,
        error: "Impossible de supprimer ce menu : des commandes y sont liees. Desactivez-le plutot (case 'Menu actif').",
      }
    }
    return { success: false, error: "Erreur lors de la suppression du menu : " + error.message }
  }

  revalidatePath("/employe/menus")
  revalidatePath("/menus")

  return { success: true }
}
