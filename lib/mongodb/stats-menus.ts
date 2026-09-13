import { Int32 } from "mongodb";
import { getMongoClient } from "./client";

interface SynchroniserStatsMenuParams {
  menuId: string;
  titreMenu: string;
  theme: string | null;
  prixTotal: number;
  dateTerminee: Date;
}

/**
 * CDC page 9 : le dashboard administrateur (nombre de commandes par menu,
 * chiffre d'affaires filtrable par menu et par duree) doit venir d'une base
 * non relationnelle. Cette fonction alimente cette base.
 *
 * Regles issues de docs/NoSQL-MongoDB-ViteGourmand.md (section 5) :
 * - declenchee uniquement au passage d'une commande au statut "termine"
 *   (jamais a la lecture du dashboard, jamais de recalcul a la volee) ;
 * - algorithme idempotent en deux temps : increment sur le mois courant
 *   s'il existe deja dans l'historique, sinon upsert avec ajout du mois ;
 * - la double ecriture Postgres puis Mongo n'est pas transactionnelle : en
 *   cas d'echec Mongo, on logue sans jamais bloquer la commande cote
 *   client. La donnee metier Postgres prime toujours sur la donnee
 *   statistique Mongo (point de vigilance documente dans le dossier RGPD).
 *
 * Note technique : le validateur Atlas de stats_menus est strict et exige
 * bsonType "int" pour nb_commandes_total et historique_mensuel.nb_commandes
 * (cf. mongodb/init/001_create_stats_menus.js). Le driver Node serialise un
 * nombre JS ordinaire en double par defaut : les increments sur ces deux
 * champs sont donc explicitement types en Int32 pour rester conformes au
 * schema, sinon la commande $inc echoue avec "Document failed validation".
 */
export async function synchroniserStatsMenu({
  menuId,
  titreMenu,
  theme,
  prixTotal,
  dateTerminee,
}: SynchroniserStatsMenuParams): Promise<void> {
  try {
    const client = await getMongoClient();
    const collection = client.db("vite_gourmand_stats").collection("stats_menus");

    const moisCourant = `${dateTerminee.getUTCFullYear()}-${String(dateTerminee.getUTCMonth() + 1).padStart(2, "0")}`;

    const resultatIncrement = await collection.updateOne(
      { menu_id: menuId, "historique_mensuel.mois": moisCourant },
      {
        $inc: {
          nb_commandes_total: new Int32(1),
          chiffre_affaires_total: prixTotal,
          "historique_mensuel.$.nb_commandes": new Int32(1),
          "historique_mensuel.$.chiffre_affaires": prixTotal,
        },
        $set: { derniere_maj: new Date() },
      },
    );

    if (resultatIncrement.matchedCount === 0) {
      await collection.updateOne(
        { menu_id: menuId },
        {
          $setOnInsert: { menu_id: menuId, titre_menu: titreMenu, theme },
          $inc: { nb_commandes_total: new Int32(1), chiffre_affaires_total: prixTotal },
          $push: {
            historique_mensuel: {
              mois: moisCourant,
              nb_commandes: new Int32(1),
              chiffre_affaires: prixTotal,
            },
          },
          $set: { derniere_maj: new Date() },
        },
        { upsert: true },
      );
    }
  } catch (erreur) {
    console.error(
      "Erreur de synchronisation vers MongoDB (stats_menus) :",
      erreur instanceof Error ? erreur.message : erreur,
    );
  }
}
