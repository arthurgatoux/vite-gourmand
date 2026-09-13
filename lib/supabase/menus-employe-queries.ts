import { createClient } from './server'

export interface MenuEmploye {
  id: string
  titre: string
  description: string | null
  theme: string | null
  prixBase: number
  nbPersonnesMin: number
  conditions: string | null
  delaiCommandeJours: number | null
  stockDisponible: number | null
  actif: boolean
}

export async function getMenusEmploye(): Promise<MenuEmploye[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('menus')
    .select('id, titre, description, theme, prix_base, nb_personnes_min, conditions, delai_commande_jours, stock_disponible, actif')
    .order('titre', { ascending: true })

  if (error || !data) {
    console.error('Erreur lors de la récupération des menus (employé):', error?.message)
    return []
  }

  return data.map(m => ({
    id: m.id,
    titre: m.titre,
    description: m.description,
    theme: m.theme,
    prixBase: Number(m.prix_base),
    nbPersonnesMin: m.nb_personnes_min,
    conditions: m.conditions,
    delaiCommandeJours: m.delai_commande_jours,
    stockDisponible: m.stock_disponible,
    actif: m.actif,
  }))
}

export interface PlatOption {
  id: string
  nom: string
  typePlat: 'entree' | 'plat' | 'dessert'
}

export async function getPlatsDisponibles(): Promise<PlatOption[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('plats')
    .select('id, nom, type_plat')
    .order('nom', { ascending: true })

  if (error || !data) {
    console.error('Erreur lors de la récupération des plats:', error?.message)
    return []
  }

  return data.map(p => ({ id: p.id, nom: p.nom, typePlat: p.type_plat }))
}

export interface RegimeOption {
  id: string
  nom: string
}

export async function getRegimesDisponibles(): Promise<RegimeOption[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('regimes').select('id, nom').order('nom', { ascending: true })

  if (error || !data) {
    console.error('Erreur lors de la récupération des régimes:', error?.message)
    return []
  }

  return data
}

export interface MenuEdition extends MenuEmploye {
  images: string[]
  platIds: string[]
  regimeIds: string[]
}

export async function getMenuPourEdition(menuId: string): Promise<MenuEdition | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('menus')
    .select(`
      id, titre, description, theme, prix_base, nb_personnes_min, conditions, delai_commande_jours, stock_disponible, actif,
      menu_images ( url, ordre ),
      menu_plat ( plat_id ),
      menu_regime ( regime_id )
    `)
    .eq('id', menuId)
    .single()

  if (error || !data) {
    console.error('Erreur lors de la récupération du menu:', error?.message)
    return null
  }

  return {
    id: data.id,
    titre: data.titre,
    description: data.description,
    theme: data.theme,
    prixBase: Number(data.prix_base),
    nbPersonnesMin: data.nb_personnes_min,
    conditions: data.conditions,
    delaiCommandeJours: data.delai_commande_jours,
    stockDisponible: data.stock_disponible,
    actif: data.actif,
    images: (data.menu_images ?? []).sort((a, b) => a.ordre - b.ordre).map(img => img.url),
    platIds: (data.menu_plat ?? []).map(mp => mp.plat_id),
    regimeIds: (data.menu_regime ?? []).map(mr => mr.regime_id),
  }
}
