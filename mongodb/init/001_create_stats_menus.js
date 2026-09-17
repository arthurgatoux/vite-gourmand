// Vite Gourmand - Initialisation MongoDB Atlas
// Base : vite_gourmand_stats | Collection : stats_menus
// Reproduit ici pour reference : execute manuellement via l'UI Atlas (Data Explorer)
// le 12/09/2026, car le connecteur MongoDB Pipedream presente un bug de resolution
// DNS SRV sur le hostname de ce cluster (cf. docs/RGPD-ViteGourmand.md notes techniques).
//
// Schema detaille, index et strategie de synchronisation : voir docs/NoSQL-MongoDB-ViteGourmand.md

use vite_gourmand_stats;

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

db.stats_menus.createIndex({ menu_id: 1 }, { unique: true });
db.stats_menus.createIndex({ "historique_mensuel.mois": 1 });
db.stats_menus.createIndex({ nb_commandes_total: -1 });

db.stats_menus.insertMany([
  {
    menu_id: "8b2bbc35-103c-4d16-a5fe-399d6eee7bf2",
    titre_menu: "Menu de Noel Traditionnel",
    theme: "noel",
    nb_commandes_total: 0,
    chiffre_affaires_total: 0,
    historique_mensuel: [],
    derniere_maj: new Date()
  },
  {
    menu_id: "fcfcd182-6950-4555-872b-81def02db937",
    titre_menu: "Menu Vegetarien Fetes",
    theme: "noel",
    nb_commandes_total: 0,
    chiffre_affaires_total: 0,
    historique_mensuel: [],
    derniere_maj: new Date()
  }
]);
