import { createClient } from './server'

export interface HoraireEmploye {
  id: string
  jourLibelle: string
  plage: string
  ordre: number
}

export async function getHorairesEmploye(): Promise<HoraireEmploye[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('horaires')
    .select('id, jour_libelle, plage, ordre')
    .order('ordre', { ascending: true })

  if (error || !data) {
    console.error('Erreur lors de la récupération des horaires (employé):', error?.message)
    return []
  }

  return data.map(h => ({ id: h.id, jourLibelle: h.jour_libelle, plage: h.plage, ordre: h.ordre }))
}
