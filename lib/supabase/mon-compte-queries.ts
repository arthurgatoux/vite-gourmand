import { createClient } from './server'
import type { StatutCommande } from './statuts-commande'

export interface CommandeHistorique {
  id: string
  menuTitre: string
  menuTheme: string | null
  datePrestation: string
  heureLivraison: string
  nbPersonnes: number
  prixTotal: number
  statutCourant: StatutCommande
  dateCreation: string
}

export interface AvisExistant {
  id: string
  note: number
  commentaire: string | null
  statutValidation: 'en_attente' | 'valide' | 'refuse'
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
  prixBaseMenu: number
  nbPersonnesMinMenu: number
  avis: AvisExistant | null
  historique: Array<{
    id: string
    statut: StatutCommande
    dateChangement: string
    motifAnnulation: string | null
    modeContactClient: string | null
  }>
}

type CommandeUtilisateurRow = {
  id: string
  date_prestation: string
  heure_livraison: string
  nb_personnes: number
  prix_total: number
  statut_courant: StatutCommande
  date_creation: string
  menus: { titre: string; theme: string | null }
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
    .returns<CommandeUtilisateurRow[]>()

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

type CommandeDetailRow = {
  id: string
  nom_client: string
  prenom_client: string
  email_client: string
  telephone_client: string | null
  adresse_prestation: string
  date_prestation: string
  heure_livraison: string
  nb_personnes: number
  distance_km: number | null
  prix_menu: number
  prix_livraison: number
  reduction_pourcentage: number
  prix_total: number
  materiel_prete: boolean
  statut_courant: StatutCommande
  date_creation: string
  menus: { titre: string; theme: string | null; prix_base: number; nb_personnes_min: number }
}

/**
 * Récupère le détail complet d'une commande avec son historique de statuts et l'avis
 * eventuellement déposé. Vérifie que la commande appartient bien au userId (RLS +
 * vérification applicative).
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
        theme,
        prix_base,
        nb_personnes_min
      )
    `)
    .eq('id', commandeId)
    .eq('utilisateur_id', userId)
    .single()
    .returns<CommandeDetailRow>()

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

  const { data: avis } = await supabase
    .from('avis')
    .select('id, note, commentaire, statut_validation')
    .eq('commande_id', commandeId)
    .maybeSingle()

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
    prixBaseMenu: Number(commande.menus.prix_base),
    nbPersonnesMinMenu: commande.menus.nb_personnes_min,
    avis: avis
      ? {
          id: avis.id,
          note: avis.note,
          commentaire: avis.commentaire,
          statutValidation: avis.statut_validation,
        }
      : null,
    historique: (historique ?? []).map(h => ({
      id: h.id,
      statut: h.statut,
      dateChangement: h.date_changement,
      motifAnnulation: h.motif_annulation,
      modeContactClient: h.mode_contact_client,
    })),
  }
}
