import { getMongoClient } from "./client";

export interface StatMenu {
  menuId: string;
  titreMenu: string;
  theme: string | null;
  nbCommandesTotal: number;
  chiffreAffairesTotal: number;
  historiqueMensuel: { mois: string; nbCommandes: number; chiffreAffaires: number }[];
}

/**
 * CDC page 9 : "il doit pouvoir visualiser depuis son espace le nombre de
 * commande par menu et pouvoir les comparer entre eux via un graphique.
 * Les donnees doivent venir d'une base de donnees non relationnelle."
 *
 * Lecture pure MongoDB, aucune jointure vers Supabase : titre_menu et theme
 * sont deja denormalises dans le document (cf.
 * docs/NoSQL-MongoDB-ViteGourmand.md, section 2), exactement pour permettre
 * cet affichage direct sans requete croisee a chaque chargement du dashboard.
 */
export async function listerStatsMenus(): Promise<StatMenu[]> {
  const client = await getMongoClient();
  const collection = client.db("vite_gourmand_stats").collection("stats_menus");

  const documents = await collection.find({}).sort({ nb_commandes_total: -1 }).toArray();

  return documents.map((doc) => ({
    menuId: String(doc.menu_id),
    titreMenu: String(doc.titre_menu),
    theme: doc.theme ?? null,
    nbCommandesTotal: Number(doc.nb_commandes_total),
    chiffreAffairesTotal: Number(doc.chiffre_affaires_total),
    historiqueMensuel: Array.isArray(doc.historique_mensuel)
      ? doc.historique_mensuel.map((h: { mois: string; nb_commandes: number; chiffre_affaires: number }) => ({
          mois: h.mois,
          nbCommandes: Number(h.nb_commandes),
          chiffreAffaires: Number(h.chiffre_affaires),
        }))
      : [],
  }));
}
