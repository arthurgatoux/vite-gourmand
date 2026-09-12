# Diagrammes de séquence — Vite Gourmand

Auteur : Arthur Gatoux (FastDev) — Projet ECF TP Développeur Web et Web Mobile (Studi)

Quatre parcours critiques, choisis parce qu'ils couvrent chacun une contrainte non négociable du CDC :
authentification sécurisée, calcul de prix avec règles métier, traçabilité de commande (jamais de mutation
destructive), et exigence de base non relationnelle pour les statistiques admin.

## 1. Inscription d'un visiteur (création de compte)

```mermaid
sequenceDiagram
    actor V as Visiteur
    participant F as Frontend (formulaire inscription)
    participant SA as Server Action
    participant Auth as Supabase Auth
    participant DB as Postgres (public.profils)
    participant Mail as Service email (Resend)

    V->>F: Saisit nom, prenom, GSM, email, adresse, mot de passe
    F->>F: Validation Zod (mdp >= 10 car., maj/min/chiffre/special)
    F->>SA: Soumission du formulaire
    SA->>Auth: auth.signUp(email, motDePasse)
    Auth->>Auth: Hash du mot de passe (jamais stocke en clair)
    Auth-->>DB: Trigger : creation du profil (role = 'utilisateur' par defaut, RG1)
    Auth-->>SA: Confirmation creation utilisateur
    SA->>Mail: Declenche l'envoi du mail de bienvenue
    Mail-->>V: Reception du mail de bienvenue
    SA-->>F: Redirection vers l'espace utilisateur
```

## 2. Commande d'un menu (calcul prix, réduction, livraison)

```mermaid
sequenceDiagram
    actor U as Utilisateur authentifie
    participant F as Frontend (page commande)
    participant SA as Server Action
    participant DB as Postgres (public.commandes)
    participant Mail as Service email

    U->>F: Arrive depuis le bouton "Commander" du menu (menu pre-rempli)
    F->>F: Saisie infos prestation (adresse, date, heure, nb personnes)
    F->>F: Verifie nbPersonnes >= menu.nbPersonnesMin (sinon blocage)
    F->>F: calculerReduction() : -10% si nbPersonnes >= min + 5 (RG2)
    F->>F: calculerPrixLivraison() : 5e si Bordeaux, sinon 5e + 0.59e/km (RG3)
    F->>U: Affiche le detail du prix (menu + livraison) avant validation
    U->>F: Valide la commande
    F->>SA: Soumission de la commande
    SA->>DB: INSERT commande (statut initial 'en_attente')
    SA->>DB: INSERT historique_statut_commande ('en_attente')
    SA->>Mail: Declenche le mail de confirmation de commande
    Mail-->>U: Reception du mail de confirmation
```

## 3. Changement de statut d'une commande par un employé

```mermaid
sequenceDiagram
    actor E as Employe
    participant F as Frontend (espace employe)
    participant SA as Server Action
    participant DB as Postgres
    participant Mongo as MongoDB Atlas (stats_menus)
    participant Mail as Service email
    actor U as Client

    E->>F: Selectionne une commande et un nouveau statut
    alt Commande deja 'acceptee' et annulation demandee
        F->>E: Exige un motif + mode de contact (RG4)
        E->>F: Confirme avoir contacte le client (GSM ou mail)
    end
    F->>SA: Soumet le changement de statut
    SA->>DB: INSERT historique_statut_commande (nouvelle ligne, jamais d'UPDATE, RG5)
    SA->>DB: UPDATE commandes.statut_courant (denormalisation pour lecture rapide)
    alt Nouveau statut = 'termine'
        SA->>Mongo: upsert stats_menus (increment nb_commandes, chiffre_affaires)
        SA->>Mail: Declenche le mail invitant a laisser un avis
    else Nouveau statut = 'attente_retour_materiel'
        SA->>Mail: Declenche le mail de notification retour materiel (RG7)
    else Autre changement de statut
        SA->>Mail: Declenche le mail de notification de statut
    end
    Mail-->>U: Reception de la notification
    SA-->>F: Confirmation de la mise a jour
```

## 4. Consultation du dashboard statistique (administrateur)

```mermaid
sequenceDiagram
    actor A as Administrateur
    participant F as Frontend (dashboard admin)
    participant SA as Server Action / API Route
    participant Mongo as MongoDB Atlas (stats_menus)

    A->>F: Ouvre le dashboard, choisit un filtre (menu et/ou periode)
    F->>SA: Requete des statistiques (menuId?, dateDebut?, dateFin?)
    SA->>Mongo: find().sort(nb_commandes_total desc) -- comparatif par menu
    SA->>Mongo: aggregate($filter sur historique_mensuel.mois) -- CA sur la periode
    Mongo-->>SA: Documents stats_menus filtres
    SA-->>F: Donnees agregees (nb commandes, CA, comparatif)
    F->>A: Affiche le graphique comparatif et le CA filtre
```

## 5. Points de vigilance transverses

- Le mot de passe n'est jamais manipulé en clair côté serveur applicatif : Supabase Auth gère le hash.
- Aucune mutation destructive de l'historique de statut (RG5) : chaque changement crée une nouvelle ligne.
- La synchronisation vers MongoDB n'a lieu qu'au passage en statut `termine`, jamais à la lecture du dashboard.
- Toutes les notifications email sont déclenchées côté serveur (Server Action), jamais côté client.
