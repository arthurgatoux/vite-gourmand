# Structure NoSQL MongoDB — Vite Gourmand

Auteur : Arthur Gatoux (FastDev) — Projet ECF TP Développeur Web et Web Mobile (Studi)

Ce document formalise la structure de la base non relationnelle exigée par le cahier des charges,
en complément du MCD relationnel (`docs/MCD-ViteGourmand.md`). Il répond exactement à l'exigence :
« il doit pouvoir visualiser depuis son espace le nombre de commande par menu et pouvoir les comparer
entre eux via un graphique. Les données doivent venir d'une base de données non relationnelle. Un calcul
de chiffre d'affaires par menu doit être disponible avec des filtres par menu, ainsi que, sur une durée. »
(CDC-ECF-Studi, page 9).

## 1. Choix de modélisation

Moteur : MongoDB Atlas, cluster `vite-gourmand`, région Europe (cohérence RGPD avec Supabase `eu-west-1`).
Base : `vite_gourmand_stats`. Collection unique : `stats_menus`.

Un document agrégé par menu plutôt qu'une collection "événements" (une ligne par commande) : le dashboard admin
ne fait que de la lecture agrégée (total par menu, comparaison entre menus, filtre par période), jamais de
recherche fine sur une commande individuelle — ce cas d'usage correspond exactement à un modèle document
pré-agrégé, plus rapide à lire qu'un `aggregate` recalculé à chaque affichage sur des millions de lignes.

## 2. Schéma du document

```json
{
  "_id": "ObjectId(...)",
  "menu_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "titre_menu": "Menu de Noël",
  "theme": "noel",
  "nb_commandes_total": 42,
  "chiffre_affaires_total": 6300.50,
  "historique_mensuel": [
    { "mois": "2026-08", "nb_commandes": 12, "chiffre_affaires": 1800.00 },
    { "mois": "2026-09", "nb_commandes": 5,  "chiffre_affaires": 750.00 }
  ],
  "derniere_maj": "2026-09-12T18:00:00Z"
}
```

- `menu_id` : clé logique vers `public.menus.id` (UUID Postgres), pas de FK physique inter-bases — cohérence
  gérée applicativement lors de la synchronisation (voir section 5).
- `titre_menu` et `theme` sont dénormalisés pour permettre l'affichage direct du dashboard sans requête croisée
  vers Supabase à chaque chargement.
- `historique_mensuel` est un tableau de sous-documents, un par mois, ce qui permet le filtre « sur une durée »
  exigé par le CDC via une simple opération `$filter` (section 6).
- Seules les commandes au statut `termine` sont comptabilisées ici : une commande `annulee` ne doit jamais
  gonfler le CA ni le nombre de commandes (cohérence avec RG4/RG5 du MCD relationnel).

## 3. Validation du schéma (Atlas `$jsonSchema`)

```javascript
db.createCollection("stats_menus", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["menu_id", "nb_commandes_total", "chiffre_affaires_total", "historique_mensuel", "derniere_maj"],
      properties: {
        menu_id: { bsonType: "string", description: "UUID du menu Postgres" },
        titre_menu: { bsonType: "string" },
        theme: { bsonType: "string" },
        nb_commandes_total: { bsonType: "int", minimum: 0 },
        chiffre_affaires_total: { bsonType: "double", minimum: 0 },
        historique_mensuel: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["mois", "nb_commandes", "chiffre_affaires"],
            properties: {
              mois: { bsonType: "string", pattern: "^[0-9]{4}-[0-9]{2}$" },
              nb_commandes: { bsonType: "int", minimum: 0 },
              chiffre_affaires: { bsonType: "double", minimum: 0 }
            }
          }
        },
        derniere_maj: { bsonType: "date" }
      }
    }
  },
  validationLevel: "strict"
});
```

## 4. Index

```javascript
db.stats_menus.createIndex({ menu_id: 1 }, { unique: true });
db.stats_menus.createIndex({ "historique_mensuel.mois": 1 });
db.stats_menus.createIndex({ nb_commandes_total: -1 });
```

- Index unique sur `menu_id` : un seul document par menu, upsert garanti.
- Index sur `historique_mensuel.mois` : accélère le filtre par durée.
- Index sur `nb_commandes_total` : accélère le tri pour le graphique comparatif entre menus.

## 5. Stratégie de synchronisation (ticket Backlog E7 — `feature/admin-sync-mongodb`)

Déclencheur : uniquement le passage d'une commande au statut `termine` dans `historique_statut_commande`
(Server Action Next.js, jamais côté client). Aucun recalcul à la volée sur Postgres : c'est cette synchronisation
qui alimente `stats_menus`, pas une requête agrégée déclenchée à chaque affichage du dashboard.

Algorithme (idempotent, en deux temps pour gérer l'ajout d'un nouveau mois) :

```javascript
// 1. Tentative d'incrément sur le mois existant
const res = await db.stats_menus.updateOne(
  { menu_id, "historique_mensuel.mois": moisCourant },
  {
    $inc: {
      nb_commandes_total: 1,
      chiffre_affaires_total: prixTotal,
      "historique_mensuel.$.nb_commandes": 1,
      "historique_mensuel.$.chiffre_affaires": prixTotal
    },
    $set: { derniere_maj: new Date() }
  }
);

// 2. Si le mois n'existe pas encore, upsert du document + push du mois
if (res.matchedCount === 0) {
  await db.stats_menus.updateOne(
    { menu_id },
    {
      $setOnInsert: { menu_id, titre_menu, theme },
      $inc: { nb_commandes_total: 1, chiffre_affaires_total: prixTotal },
      $push: { historique_mensuel: { mois: moisCourant, nb_commandes: 1, chiffre_affaires: prixTotal } },
      $set: { derniere_maj: new Date() }
    },
    { upsert: true }
  );
}
```

Point de vigilance à documenter dans le dossier de sécurité : cette double écriture (Postgres puis Mongo) n'est
pas transactionnelle entre les deux bases. En cas d'échec de la synchronisation Mongo, il faut prévoir un log
d'erreur serveur et une tâche de réconciliation manuelle plutôt que de bloquer la commande côté utilisateur —
la donnée métier (Postgres) doit toujours primer sur la donnée statistique (Mongo).

## 6. Requêtes du dashboard administrateur

Comparatif du nombre de commandes par menu (graphique) :

```javascript
db.stats_menus.find({}, { menu_id: 1, titre_menu: 1, nb_commandes_total: 1 })
  .sort({ nb_commandes_total: -1 });
```

Chiffre d'affaires par menu, filtré sur une période donnée (ex. juillet à septembre 2026) :

```javascript
db.stats_menus.aggregate([
  { $match: { menu_id: "3fa85f64-5717-4562-b3fc-2c963f66afa6" } },
  { $project: {
      titre_menu: 1,
      periode: {
        $filter: {
          input: "$historique_mensuel",
          cond: { $and: [
            { $gte: ["$$this.mois", "2026-07"] },
            { $lte: ["$$this.mois", "2026-09"] }
          ]}
        }
      }
  }},
  { $project: {
      titre_menu: 1,
      ca_periode: { $sum: "$periode.chiffre_affaires" },
      nb_commandes_periode: { $sum: "$periode.nb_commandes" }
  }}
]);
```

Ces deux requêtes couvrent exactement les deux filtres exigés par le CDC : « par menu » et « sur une durée ».

## 7. Prochaine étape

Création du cluster MongoDB Atlas (Phase 2 de la Todo Global) puis implémentation du script de synchronisation
côté Server Action (ticket Backlog E7, branche `feature/admin-sync-mongodb`).
