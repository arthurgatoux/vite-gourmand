# Fiche d'analyse des besoins : Vite & Gourmand

**Auteur :** Arthur Gatoux (FastDev)
**Projet :** ECF TP Développeur Web et Web Mobile (Studi)
**Client :** Julie et José, entreprise « Vite & Gourmand », Bordeaux

## 1. Contexte et objectif métier

Vite & Gourmand est une entreprise traiteur événementiel bordelaise, existante depuis 25 ans, qui gérait jusqu'ici ses menus par mail auprès d'une clientèle d'habitués. L'application a deux objectifs : augmenter la visibilité de l'entreprise et simplifier la commande de menus événementiels pour tout public, tout en conservant un contrôle humain fort sur le traitement des commandes (aucun processus n'est jamais entièrement automatisé côté cuisine ou livraison).

Contrainte contractuelle explicite : *« Le chef de projet conclut que le client exige le déploiement de l'application et que des Pénalités seront appliquées si l'application n'est pas en ligne et fonctionnelle au moment de la livraison. »* Le déploiement Vercel n'est donc pas une option secondaire mais un critère de recevabilité du projet.

## 2. Les quatre rôles et leurs besoins

| Rôle | Peut faire | Ne peut pas faire |
|---|---|---|
| Visiteur (non authentifié) | Consulter accueil, menus (vue globale et détail), filtrer, contacter, créer un compte | Commander (redirigé vers connexion ou inscription), voir les espaces privés |
| Utilisateur | Tout ce que fait un visiteur, plus commander, consulter, modifier ou annuler ses commandes (avant le statut « accepté »), suivre une commande, laisser un avis après une commande « terminée » | Modifier le menu commandé, accéder à l'espace employé ou admin |
| Employé | Modifier ou supprimer menus, plats et horaires ; mettre à jour le statut des commandes après contact client ; valider ou refuser les avis ; filtrer les commandes | Créer un compte employé ou admin, annuler une commande sans avoir contacté le client au préalable |
| Administrateur | Tout ce que fait un employé, plus créer ou désactiver des comptes employé, consulter le dashboard NoSQL (nombre de commandes par menu, chiffre d'affaires, comparatif graphique) | Créer un compte administrateur depuis l'application (création uniquement manuelle, hors interface) |

Règle de gestion critique à documenter dans le dossier de sécurité : *« José précise que vous devez lui créer ce compte et qu'il ne doit pas être possible de créer un compte Administrateur depuis l'application. »* Cela correspond à la règle de gestion RG1 du MCD : le rôle `administrateur` n'est jamais atteignable via un formulaire applicatif.

## 3. Parcours fonctionnels clés (reformulés)

### 3.1 Découverte et filtrage des menus

Le visiteur doit pouvoir filtrer la vue globale des menus par prix maximum, fourchette de prix, thème, régime alimentaire et nombre de personnes minimum, avec une actualisation dynamique, sans rechargement de page. C'est une exigence technique explicite qui impose un filtrage côté client (fetch ou API combiné à un state React) plutôt qu'un rechargement serveur classique.

### 3.2 Commande et tarification

Le calcul du prix repose sur trois règles combinées, extraites du CDC et formalisées dans le MCD (`docs/MCD-ViteGourmand.md`) :

- **RG2 (réduction)** : réduction de 10% si le nombre de personnes est supérieur ou égal au minimum du menu plus 5, sinon 0%.
- **RG3 (livraison)** : 5€ fixes si la prestation a lieu à Bordeaux, sinon 5€ plus 0,59€ par kilomètre.
- **Contrainte de quantité minimale** : impossible de commander sous le seuil minimum du menu.

Le prix total doit être visible en détail (prix du menu et prix de la livraison) avant validation, et les conditions du menu (délai de commande, précautions de stockage) doivent être mises en évidence pour éviter toute contestation client : exigence de traçabilité contractuelle explicite du CDC.

### 3.3 Cycle de vie d'une commande

La commande suit un automate à 8 statuts : en attente, accepté, en préparation, en livraison, livré, éventuellement en attente de retour matériel, puis terminée, ou bien annulée à tout moment avant acceptation.

**RG4** : passé le statut « accepté », le client ne peut plus modifier ni annuler seul ; seul l'employé peut agir, et uniquement après contact téléphonique ou mail, avec motif obligatoire.

**RG5** : chaque changement de statut crée une nouvelle ligne dans l'historique, jamais une mise à jour destructive, ce qui est nécessaire pour la traçabilité RGPD et pour le suivi client en temps réel.

### 3.4 Gestion du matériel prêté

Fonctionnalité à ne pas sous-estimer : si du matériel est prêté, le statut « en attente de retour matériel » déclenche un mail automatique. La règle **RG7** applique des frais de 600€ si le matériel n'est pas restitué sous 10 jours ouvrés, ce qui nécessite une tâche planifiée (cron ou Server Action déclenchée) pour vérifier le délai.

### 3.5 Avis clients

**RG6** : un avis (note de 1 à 5 accompagnée d'un commentaire) n'est visible sur la page d'accueil qu'après validation explicite par un employé (statut de validation « validé »). Le circuit est le suivant : commande terminée, puis mail invitant à laisser un avis, puis dépôt par l'utilisateur, puis modération employé, puis affichage conditionnel sur l'accueil.

## 4. Exigences non fonctionnelles

### 4.1 Sécurité et authentification

- Mot de passe de 10 caractères minimum, avec majuscule, minuscule, chiffre et caractère spécial, à valider aussi bien côté client (pour l'UX) que côté serveur (Zod et policy Supabase Auth), jamais côté client seul.
- Mail de bienvenue automatique à l'inscription, mail de confirmation de commande, mail de réinitialisation de mot de passe, mail de notification de changement de statut : tous transactionnels, donc à déclencher côté serveur (Server Action ou Edge Function), jamais côté client.
- Gestion des rôles combinant middleware Next.js et Row Level Security Supabase (défense en profondeur, jamais l'un sans l'autre).

### 4.2 RGPD

Le CDC renvoie explicitement à la conformité RGPD dès la page d'accueil (*« veillez à respecter les aspects réglementaires (RGPD et sécurité) »*). Cela implique, à formaliser en phase de conception :

- Base légale du traitement (exécution du contrat pour les commandes, consentement pour une éventuelle newsletter).
- Minimisation des données collectées à l'inscription (nom, prénom, numéro de mobile, email, adresse postale, mot de passe, rien de plus).
- Durée de conservation à définir (par exemple suppression ou anonymisation des comptes inactifs après une période donnée).
- Hébergement des données en région UE, déjà acté via le choix de la région Supabase `eu-west-1`.
- Page mentions légales et CGV obligatoires en pied de page.

### 4.3 RGAA

Le CDC impose : *« vous devrez rendre l'application accessible, conformément au RGAA. »* Cela concerne en particulier le contraste des couleurs, les alternatives textuelles sur la galerie d'images des menus, la navigation clavier complète des formulaires de commande et de connexion, une structure sémantique HTML5 correcte, et des messages d'erreur de formulaire correctement associés à leur champ (via `aria-describedby`).

### 4.4 Base de données double (relationnelle et NoSQL)

Exigence non négociable du CDC : *« Aucune technologie n'est obligatoire pour cet ECF, à l'exception de l'utilisation d'une base de données relationnelle et non relationnelle. »* Le choix retenu est PostgreSQL (Supabase) pour les données transactionnelles et relationnelles, et MongoDB Atlas pour l'agrégat statistique du dashboard admin (nombre de commandes par menu, chiffre d'affaires), conformément à l'exigence selon laquelle ces données doivent venir d'une base de données non relationnelle.

## 5. Livrables attendus (rappel de traçabilité)

D'après le CDC (pages 11 et 12) :

- Dépôt GitHub public, avec README.md détaillant la procédure d'installation locale, workflow `main`, `develop` et `feature/*`, fichiers SQL de création et d'intégration de données.
- Application déployée et fonctionnelle (pénalités contractuelles en cas d'échec).
- Lien vers l'outil de gestion de projet (Notion).
- Manuel d'utilisation en PDF, avec identifiants de test par rôle.
- Charte graphique en PDF (palette, police, 3 maquettes bureau et 3 mobile).
- Documentation de gestion de projet.
- Documentation technique (réflexions technologiques, configuration de l'environnement, MCD ou diagramme de classes, diagrammes d'utilisation et de séquence, documentation de déploiement).

## 6. Risques identifiés

- **Synchronisation PostgreSQL vers MongoDB** : nécessite un mécanisme fiable, déclenché à chaque passage au statut « terminée », pour éviter une dérive entre les deux bases, à documenter précisément dans la documentation technique.
- **RGAA sous-estimé** : à traiter dès l'intégration front, pas en correction finale, car il touche la structure même des composants.
- **Frais matériel (RG7)** : nécessite un job planifié, absent des stacks purement statiques, à anticiper lors du développement back-end (Edge Function planifiée ou cron Vercel).
