import { createClient } from './server'
import type { StatutCommande } from './statuts-commande'

export interface PretMaterielCommande {
  id: string
  dateLimiteRetour: string
  restitue: boolean
  fraisAppliques: boolean
}

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
  materielPrete: boolean
  pretMateriel: PretMaterielCommande | null
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
      materiel_prete,
      menus (
        titre
      ),
      prets_materiel (
        id,
        date_limite_retour,
        restitue,
        frais_appliques
      )
    `)
    .order('date_creation', { ascending: false })

  if (error || !data) {
    console.error('Erreur lors de la récupération des commandes (employé):', error?.message)
    return []
  }

  return data.map(cmd => {
    const pret = Array.isArray(cmd.prets_materiel) ? cmd.prets_materiel[0] : cmd.prets_materiel

    return {
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
      materielPrete: cmd.materiel_prete,
      pretMateriel: pret
        ? {
            id: pret.id,
            dateLimiteRetour: pret.date_limite_retour,
            restitue: pret.restitue,
            fraisAppliques: pret.frais_appliques,
          }
        : null,
    }
  })
}

export interface AvisEmploye {
  id: string
  note: number
  commentaire: string | null
  nomClient: string
  prenomClient: string
  menuTitre: string
  dateCreation: string
}

/**
 * Recupere les avis en attente de moderation pour l'espace employe/admin.
 * Protege par la policy RLS `employe_admin_lisent_tous_avis` (clause est_employe_ou_admin()).
 */
export async function getAvisEnAttente(): Promise<AvisEmploye[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('avis')
    .select(`
      id,
      note,
      commentaire,
      date_creation,
      commandes (
        nom_client,
        prenom_client,
        menus (
          titre
        )
      )
    `)
    .eq('statut_validation', 'en_attente')
    .order('date_creation', { ascending: true })

  if (error || !data) {
    console.error('Erreur lors de la récupération des avis (employé):', error?.message)
    return []
  }

  return data.map(a => ({
    id: a.id,
    note: a.note,
    commentaire: a.commentaire,
    nomClient: a.commandes.nom_client,
    prenomClient: a.commandes.prenom_client,
    menuTitre: a.commandes.menus.titre,
    dateCreation: a.date_creation,
  }))
}
