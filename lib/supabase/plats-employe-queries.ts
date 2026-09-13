import { createClient } from './server'

export interface AllergeneOption {
  id: string
  nom: string
}

export async function getAllergenesDisponibles(): Promise<AllergeneOption[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('allergenes').select('id, nom').order('nom', { ascending: true })

  if (error || !data) {
    console.error('Erreur lors de la récupération des allergènes:', error?.message)
    return []
  }

  return data
}

export interface PlatEmploye {
  id: string
  nom: string
  description: string | null
  typePlat: 'entree' | 'plat' | 'dessert'
  allergeneIds: string[]
  nombreMenus: number
}

export async function getPlatsEmploye(): Promise<PlatEmploye[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('plats')
    .select(`
      id, nom, description, type_plat,
      plat_allergene ( allergene_id ),
      menu_plat ( menu_id )
    `)
    .order('nom', { ascending: true })

  if (error || !data) {
    console.error('Erreur lors de la récupération des plats (employé):', error?.message)
    return []
  }

  return data.map(p => ({
    id: p.id,
    nom: p.nom,
    description: p.description,
    typePlat: p.type_plat,
    allergeneIds: (p.plat_allergene ?? []).map(pa => pa.allergene_id),
    nombreMenus: (p.menu_plat ?? []).length,
  }))
}

export interface PlatEdition {
  id: string
  nom: string
  description: string | null
  typePlat: 'entree' | 'plat' | 'dessert'
  allergeneIds: string[]
}

export async function getPlatPourEdition(platId: string): Promise<PlatEdition | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('plats')
    .select(`
      id, nom, description, type_plat,
      plat_allergene ( allergene_id )
    `)
    .eq('id', platId)
    .single()

  if (error || !data) {
    console.error('Erreur lors de la récupération du plat:', error?.message)
    return null
  }

  return {
    id: data.id,
    nom: data.nom,
    description: data.description,
    typePlat: data.type_plat,
    allergeneIds: (data.plat_allergene ?? []).map(pa => pa.allergene_id),
  }
}
