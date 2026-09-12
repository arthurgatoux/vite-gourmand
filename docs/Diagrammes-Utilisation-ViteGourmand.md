# Diagrammes de cas d'utilisation — Vite Gourmand

Auteur : Arthur Gatoux (FastDev) — Projet ECF TP Développeur Web et Web Mobile (Studi)

Ces diagrammes traduisent en UML le tableau rôle/permissions de `docs/Analyse-Besoins-ViteGourmand.md`,
lui-même issu du CDC (page 3 à 9). Mermaid n'ayant pas de type de diagramme "cas d'usage" natif, chaque
acteur est représenté par un rectangle, et chaque cas d'usage par une forme "stadium" (convention standard
pour ce rendu en flowchart Mermaid).

## 1. Visiteur (non authentifié)

```mermaid
flowchart LR
    Visiteur([Visiteur])
    Visiteur --> UC1(Consulter la page d'accueil)
    Visiteur --> UC2(Consulter la vue globale des menus)
    Visiteur --> UC3(Filtrer les menus<br/>prix, thème, régime, personnes)
    Visiteur --> UC4(Consulter le détail d'un menu)
    Visiteur --> UC5(Créer un compte)
    Visiteur --> UC6(Contacter l'entreprise)
    Visiteur -.impossible.-> UC7(Commander)
    UC7 -. redirection .-> UC8(Se connecter / S'inscrire)
```

## 2. Utilisateur (authentifié, rôle `utilisateur`)

```mermaid
flowchart LR
    Utilisateur([Utilisateur])
    Utilisateur --> UC1(Tout ce que fait un Visiteur)
    Utilisateur --> UC2(Commander un menu)
    Utilisateur --> UC3(Consulter ses commandes)
    Utilisateur --> UC4(Modifier une commande<br/>si statut avant 'accepte')
    Utilisateur --> UC5(Annuler une commande<br/>si statut avant 'accepte')
    Utilisateur --> UC6(Suivre le statut d'une commande)
    Utilisateur --> UC7(Laisser un avis<br/>apres commande 'termine')
    Utilisateur --> UC8(Modifier ses informations personnelles)
    Utilisateur -.impossible.-> UC9(Modifier le menu commande)
    Utilisateur -.impossible.-> UC10(Acceder aux espaces Employe/Admin)
```

## 3. Employé (rôle `employe`)

```mermaid
flowchart LR
    Employe([Employe])
    Employe --> UC1(Modifier / supprimer un menu)
    Employe --> UC2(Modifier / supprimer un plat)
    Employe --> UC3(Modifier les horaires)
    Employe --> UC4(Filtrer les commandes<br/>par statut ou par client)
    Employe --> UC5(Mettre a jour le statut d'une commande)
    Employe --> UC6(Valider un avis)
    Employe --> UC7(Refuser un avis)
    Employe -.impossible sans contact prealable.-> UC8(Annuler une commande acceptee)
    UC8 -. necessite .-> UC9(Contacter le client<br/>GSM ou mail + motif obligatoire)
    Employe -.impossible.-> UC10(Creer un compte Employe ou Admin)
```

## 4. Administrateur (rôle `administrateur`)

```mermaid
flowchart LR
    Administrateur([Administrateur])
    Administrateur --> UC1(Tout ce que fait un Employe)
    Administrateur --> UC2(Creer un compte Employe)
    Administrateur --> UC3(Desactiver un compte Employe)
    Administrateur --> UC4(Consulter le dashboard NoSQL<br/>nb commandes par menu)
    Administrateur --> UC5(Comparer les menus<br/>via un graphique)
    Administrateur --> UC6(Calculer le CA par menu<br/>filtre par menu et par duree)
    Administrateur -.impossible, RG1.-> UC7(Creer un compte Administrateur<br/>depuis l'application)
```

## 5. Synthèse des règles d'accès transversales

| Règle | Description | Origine |
|---|---|---|
| RG1 | Le rôle administrateur n'est jamais atteignable via un formulaire applicatif (création manuelle uniquement) | CDC p.9 |
| RG4 | Une commande ne peut être modifiée/annulée par l'utilisateur qu'avant le statut `accepte` | CDC p.7 |
| — | Un employé ne peut annuler une commande acceptée sans avoir contacté le client au préalable (motif obligatoire) | CDC p.8 |
| RG6 | Un avis n'est visible sur l'accueil qu'après validation par un employé | CDC p.7 |

Ces diagrammes serviront de base aux diagrammes de séquence des parcours critiques (étape suivante de la Todo Global).
