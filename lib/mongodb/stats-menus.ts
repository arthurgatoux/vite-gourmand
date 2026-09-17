import { Int32 } from "mongodb";
import { getMongoClient } from "./client";

interface SynchroniserStatsMenuParams {
  menuId: string;
  titreMenu: string;
  theme: string | null;
  prixTotal: number;
  dateTerminee: Date;
}

interface StatsMenuDocument {
  menu_id: string;
  titre_menu: string;
  theme: string | null;
  nb_commandes_total: number;
  chiffre_affaires_total: number;
  historique_mensuel: { mois: string; nb_commandes: number; chiffre_affaires: number }[];
  derniere_maj: Date;
}

export async function synchroniserStatsMenu({
  menuId,
  titreMenu,
  theme,
  prixTotal,
  dateTerminee,
}: SynchroniserStatsMenuParams): Promise<void> {
  try {
    const client = await getMongoClient();
    const collection = client.db("vite_gourmand_stats").collection<StatsMenuDocument>("stats_menus");

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
