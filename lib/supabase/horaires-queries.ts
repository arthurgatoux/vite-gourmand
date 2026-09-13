import { createClient } from './server'

export interface HoraireAffichage {
  id: string
  jourLibelle: string
  plage: string
}

export async function getHorairesPublics(): Promise<HoraireAffichage[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('horaires')
    .select('id, jour_libelle, plage')
    .order('ordre', { ascending: true })

  if (error || !data) {
    console.error('Erreur lors de la récupération des horaires:', error?.message)
    return []
  }

  return data.map(h => ({ id: h.id, jourLibelle: h.jour_libelle, plage: h.plage }))
}
