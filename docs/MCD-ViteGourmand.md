# Modèle Conceptuel de Données — Vite Gourmand

## 1. Diagramme entité-association (Mermaid)

```mermaid
erDiagram
    UTILISATEUR ||--o{ COMMANDE : passe
    UTILISATEUR ||--o{ AVIS : redige
    MENU ||--o{ COMMANDE : concerne
    MENU ||--o{ MENU_IMAGE : possede
    MENU }o--o{ PLAT : compose_de
    MENU }o--o{ REGIME : correspond_a
    PLAT }o--o{ ALLERGENE : contient
    COMMANDE ||--o{ HISTORIQUE_STATUT_COMMANDE : suit
    COMMANDE |o--o| PRET_MATERIEL : implique
    COMMANDE |o--o| AVIS : genere

    UTILISATEUR {
        uuid id PK
        string nom
        string prenom
        string email UK
        string telephone
        string adresse_postale
        string role "utilisateur|employe|administrateur"
        boolean compte_actif
        timestamp date_creation
    }

    MENU {
        uuid id PK
        string titre
        text description
        string theme "noel|paques|classique|evenement"
        numeric prix_base
        int nb_personnes_min
        text conditions
        int delai_commande_jours
        int stock_disponible
        boolean actif
    }

    MENU_IMAGE {
        uuid id PK
        uuid menu_id FK
        string url
        int ordre
    }

    PLAT {
        uuid id PK
        string nom
        text description
        string type_plat "entree|plat|dessert"
    }

    ALLERGENE {
        uuid id PK
        string nom UK
    }

    REGIME {
        uuid id PK
        string nom UK "vegetarien|vegan|classique"
    }

    MENU_PLAT {
        uuid menu_id FK
        uuid plat_id FK
    }

    PLAT_ALLERGENE {
        uuid plat_id FK
        uuid allergene_id FK
    }

    MENU_REGIME {
        uuid menu_id FK
        uuid regime_id FK
    }

    COMMANDE {
        uuid id PK
        uuid utilisateur_id FK
        uuid menu_id FK
        string nom_client
        string prenom_client
        string email_client
        string telephone_client
        string adresse_prestation
        date date_prestation
        time heure_livraison
        int nb_personnes
        numeric distance_km
        numeric prix_menu
        numeric prix_livraison
        numeric reduction_pourcentage
        numeric prix_total
        boolean materiel_prete
        timestamp date_creation
    }

    HISTORIQUE_STATUT_COMMANDE {
        uuid id PK
        uuid commande_id FK
        string statut "en_attente|accepte|en_preparation|en_livraison|livre|attente_retour_materiel|termine|annule"
        timestamp date_changement
        text motif_annulation
        string mode_contact_client
    }

    PRET_MATERIEL {
        uuid id PK
        uuid commande_id FK
        text description_materiel
        date date_pret
        date date_limite_retour
        boolean restitue
        boolean frais_appliques
    }

    AVIS {
        uuid id PK
        uuid commande_id FK
        uuid utilisateur_id FK
        int note "1 a 5"
        text commentaire
        string statut_validation "en_attente|valide|refuse"
        timestamp date_creation
    }

    MESSAGE_CONTACT {
        uuid id PK
        string titre
        text description
        string email
        timestamp date_creation
        boolean traite
    }
```

## 2. Règles de gestion issues

- RG1 : le rôle `administrateur` ne peut pas être attribué via un formulaire applicatif (création uniquement en base ou via un compte admin existant).
- RG2 : `reduction_pourcentage` = 10 si `nb_personnes >= nb_personnes_min + 5`, sinon 0.
- RG3 : `prix_livraison` = 5 + (0.59 * distance_km) si la ville de prestation != Bordeaux, sinon 5.
- RG4 : une commande ne peut pas être annulée/modifiée par l'utilisateur une fois passée au statut `accepte`.
- RG5 : chaque changement de statut de commande crée une nouvelle ligne dans `HISTORIQUE_STATUT_COMMANDE` (jamais d'update destructif sur l'historique).
- RG6 : un avis n'est visible sur la page d'accueil que si `statut_validation = valide`.
- RG7 : `frais_appliques` passe à `true` si `restitue = false` après 10 jours ouvrés suivant le statut `attente_retour_materiel`.

## 3. Notes de conception NoSQL (MongoDB)

Collection `stats_menus` (document agrégé, recalculé ou mis à jour à chaque commande) :

```json
{
  "menu_id": "uuid-postgres",
  "titre_menu": "Menu de Noël",
  "nb_commandes": 42,
  "chiffre_affaires_total": 6300.50,
  "historique_mensuel": [
    { "mois": "2026-09", "nb_commandes": 5, "ca": 750.00 }
  ]
}
```

Cette collection est alimentée par une synchronisation applicative (Server Action) déclenchée à chaque changement de statut de commande vers `termine`, évitant de recalculer les agrégats à la volée sur PostgreSQL.
