import createClient from './server'

export interface CommandeHistorique {
  id: string
  menuTitre: string
  menuTheme: string | null
  datePrestation: string
  heureLivraison: string
  nbPersonnes: number
  prixTotal: number
  statutCourant: 'en_attente' | 'accepte' | 'en_preparation' | 'en_livraison' | 'livre' | 'attente_retour_materiel' | 'termine' | 'annule'
  dateCreation: string
}

export interface CommandeDetail extends CommandeHistorique {
  nomClient: string
  prenomClient: string
  emailClient: string
  telephoneClient: string | null
  adressePrestation: string
  distanceKm: number | null
  prixMenu: number
  prixLivraison: number
  reductionPourcentage: number
  materielPrete: boolean
  historique: Array<{
    id: string
    statut: string
    dateChangement: string
    motifAnnulation: string | null
    modeContactClient: string | null
  }>
}

/**
 * Récupère l'historique des commandes du profil connecté.
 * Utilise la policy RLS `utilisateur_lit_ses_commandes` (security_invoker).
 */
export async function getCommandesUtilisateur(userId: string): Promise<CommandeHistorique[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('commandes')
    .select(`
      id,
      date_prestation,
      heure_livraison,
      nb_personnes,
      prix_total,
      statut_courant,
      date_creation,
      menus (
        titre,
        theme
      )
    `)
    .eq('utilisateur_id', userId)
    .order('date_creation', { ascending: false })

  if (error || !data) {
    console.error('Erreur lors de la récupération des commandes:', error?.message)
    return []
  }

  return data.map(cmd => ({
    id: cmd.id,
    menuTitre: cmd.menus.titre,
    menuTheme: cmd.menus.theme,
    datePrestation: cmd.date_prestation,
    heureLivraison: cmd.heure_livraison,
    nbPersonnes: cmd.nb_personnes,
    prixTotal: Number(cmd.prix_total),
    statutCourant: cmd.statut_courant,
    dateCreation: cmd.date_creation,
  }))
}

/**
 * Récupère le détail complet d'une commande avec son historique de statuts.
 * Vérifie que la commande appartient bien au userId (RLS + vérification applicative).
 */
export async function getCommandeDetail(
  commandeId: string,
  userId: string
): Promise<CommandeDetail | null> {
  const supabase = await createClient()

  const { data: commande, error: erreurCmd } = await supabase
    .from('commandes')
    .select(`
      id,
      nom_client,
      prenom_client,
      email_client,
      telephone_client,
      adresse_prestation,
      date_prestation,
      heure_livraison,
      nb_personnes,
      distance_km,
      prix_menu,
      prix_livraison,
      reduction_pourcentage,
      prix_total,
      materiel_prete,
      statut_courant,
      date_creation,
      menus (
        titre,
        theme
      )
    `)
    .eq('id', commandeId)
    .eq('utilisateur_id', userId)
    .single()

  if (erreurCmd || !commande) {
    console.error('Erreur ou commande non trouvée:', erreurCmd?.message)
    return null
  }

  const { data: historique, error: erreurHist } = await supabase
    .from('historique_statut_commande')
    .select('id, statut, date_changement, motif_annulation, mode_contact_client')
    .eq('commande_id', commandeId)
    .order('date_changement', { ascending: true })

  if (erreurHist || !historique) {
    console.error('Erreur lors de la récupération de l\'historique:', erreurHist?.message)
  }

  return {
    id: commande.id,
    menuTitre: commande.menus.titre,
    menuTheme: commande.menus.theme,
    datePrestation: commande.date_prestation,
    heureLivraison: commande.heure_livraison,
    nbPersonnes: commande.nb_personnes,
    prixTotal: Number(commande.prix_total),
    statutCourant: commande.statut_courant,
    dateCreation: commande.date_creation,
    nomClient: commande.nom_client,
    prenomClient: commande.prenom_client,
    emailClient: commande.email_client,
    telephoneClient: commande.telephone_client,
    adressePrestation: commande.adresse_prestation,
    distanceKm: commande.distance_km ? Number(commande.distance_km) : null,
    prixMenu: Number(commande.prix_menu),
    prixLivraison: Number(commande.prix_livraison),
    reductionPourcentage: Number(commande.reduction_pourcentage),
    materielPrete: commande.materiel_prete,
    historique: (historique ?? []).map(h => ({
      id: h.id,
      statut: h.statut,
      dateChangement: h.date_changement,
      motifAnnulation: h.motif_annulation,
      modeContactClient: h.mode_contact_client,
    })),
  }
}
