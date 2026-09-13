import { createClient } from './server'
import type { StatutCommande } from './statuts-commande'

export interface CommandeEmploye {
  id: string
  nomClient: string
  prenomClient: string
  emailClient: string
  menuTitre: string
  datePrestation: string
  nbPersonnes: number
  prixTotal: number
  statutCourant: StatutCommande
  dateCreation: string
}

/**
 * Recupere toutes les commandes (tous clients) pour l'espace employe/admin.
 * Protege par la policy RLS `utilisateur_lit_ses_commandes` (clause est_employe_ou_admin()).
 */
export async function getCommandesEmploye(): Promise<CommandeEmploye[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('commandes')
    .select(`
      id,
      nom_client,
      prenom_client,
      email_client,
      date_prestation,
      nb_personnes,
      prix_total,
      statut_courant,
      date_creation,
      menus (
        titre
      )
    `)
    .order('date_creation', { ascending: false })

  if (error || !data) {
    console.error('Erreur lors de la récupération des commandes (employé):', error?.message)
    return []
  }

  return data.map(cmd => ({
    id: cmd.id,
    nomClient: cmd.nom_client,
    prenomClient: cmd.prenom_client,
    emailClient: cmd.email_client,
    menuTitre: cmd.menus.titre,
    datePrestation: cmd.date_prestation,
    nbPersonnes: cmd.nb_personnes,
    prixTotal: Number(cmd.prix_total),
    statutCourant: cmd.statut_courant,
    dateCreation: cmd.date_creation,
  }))
}
