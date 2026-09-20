import { createClient } from './server'

export interface ProfilComplet {
  id: string
  nom: string
  prenom: string
  email: string
  telephone: string | null
  adressePostale: string | null
}

// Récupère les informations personnelles du profil connecté
export async function getProfilComplet(userId: string): Promise<ProfilComplet | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profils')
    .select('id, nom, prenom, email, telephone, adresse_postale')
    .eq('id', userId)
    .single()

  if (error || !data) {
    console.error('Erreur lors de la récupération du profil:', error?.message)
    return null
  }

  return {
    id: data.id,
    nom: data.nom,
    prenom: data.prenom,
    email: data.email,
    telephone: data.telephone,
    adressePostale: data.adresse_postale,
  }
}
