# Plan de tests manuels — Vite Gourmand (Phase 5, ECF Studi)

Auteur : Arthur Gatoux — FastDev — Projet ECF TP Développeur Web et Web Mobile Studi
Objectif : vérifier chaque parcours utilisateur par rôle (CDC page 3 : visiteur, utilisateur, employé, administrateur), conformément à la Todo Global Phase 5.
Méthode : test manuel exploratoire, statut à renseigner après exécution (OK / KO / Non testé). Toute anomalie détectée doit être reportée en ticket Backlog Notion (Epic correspondant) avant correction.

Légende statut : ✅ OK · ❌ KO · ⬜ Non testé

## 1. Rôle Visiteur (non authentifié)

| ID | Parcours | Étapes | Résultat attendu | Réf. CDC | Statut |
|---|---|---|---|---|---|
| V1 | Page d'accueil | Ouvrir `/` | Présentation entreprise, mise en avant équipe, avis validés visibles (avis non validés absents) | p.3 | ⬜ |
| V2 | Navigation menu applicatif | Vérifier le header | Retour accueil, accès menus, connexion, contact tous présents | p.4 | ⬜ |
| V3 | Pied de page | Scroller en bas de `/` | Horaires lundi→dimanche, liens mentions légales et CGV présents et fonctionnels | p.4 | ⬜ |
| V4 | Vue globale des menus | Aller sur `/menus` sans être connecté | Liste des menus visible (titre, description, prix, nb pers. min, bouton détail) | p.5 | ⬜ |
| V5 | Filtres dynamiques | Sur `/menus`, appliquer filtre prix max, fourchette prix, thème, régime, nb pers. min | Liste mise à jour sans rechargement de page (pas de flash / reload visible) | p.5 | ⬜ |
| V6 | Combinaison de filtres | Cumuler 2-3 filtres simultanément | Résultat cohérent avec l'intersection des critères | p.5 | ⬜ |
| V7 | Vue détaillée d'un menu | Cliquer sur un menu depuis `/menus` | Toutes les infos BDD visibles (galerie, plats, allergènes, régime, conditions mises en évidence, stock) | p.4-5 | ⬜ |
| V8 | Commande sans compte | Cliquer "Commander" sur la vue détaillée en étant visiteur | Redirection vers connexion/inscription (pas d'accès direct à `/commande`) | p.6 | ⬜ |
| V9 | Création de compte | Aller sur inscription, remplir nom/prénom/GSM/email/adresse/mot de passe | Compte créé avec rôle "utilisateur", email de bienvenue reçu | p.5 | ⬜ |
| V10 | Validation mot de passe | Tester un mot de passe < 10 car. ou sans maj/min/chiffre/spécial | Rejet avec message d'erreur explicite (lié RGAA 11.10 aria-describedby) | p.5 | ⬜ |
| V11 | Connexion | Se connecter avec email + mot de passe créés en V9 | Connexion réussie, redirection vers espace utilisateur | p.5 | ⬜ |
| V12 | Mot de passe oublié | Cliquer "mot de passe oublié", saisir email | Email de réinitialisation reçu, lien fonctionnel | p.5 | ⬜ |
| V13 | Formulaire de contact | Aller sur `/contact`, remplir titre/description/email, envoyer | Email reçu côté entreprise avec `reply_to` = email du visiteur | p.9 | ⬜ |
| V14 | Accessibilité RGAA de base | Naviguer au clavier (Tab) sur `/`, `/menus`, `/contact` | Focus visible (contour 3px), skip-link fonctionnel, `lang="fr"` | p.9 | ⬜ |

## 2. Rôle Utilisateur (authentifié, rôle "utilisateur")

| ID | Parcours | Étapes | Résultat attendu | Réf. CDC | Statut |
|---|---|---|---|---|---|
| U1 | Commande pré-remplie | Depuis un menu, cliquer "Commander" en étant connecté | Redirigé vers `/commande` avec menu déjà positionné | p.6-7 | ⬜ |
| U2 | Auto-remplissage infos | Arriver sur `/commande` | Nom, prénom, email, GSM déjà pré-remplis depuis le profil | p.7 | ⬜ |
| U3 | Adresse & livraison | Saisir une adresse hors Bordeaux | Frais de livraison = 5€ + 0,59€/km appliqués et affichés | p.7 | ⬜ |
| U4 | Nombre de personnes minimum | Essayer de commander sous le nb minimum du menu | Blocage / message d'erreur, impossible de valider | p.7 | ⬜ |
| U5 | Réduction 10% | Commander avec nb pers. min + 5 | Réduction de 10% visible sur le récapitulatif avant validation | p.7 | ⬜ |
| U6 | Délai de commande | Choisir une date de prestation trop proche (< délai du menu) | Blocage côté serveur (règle métier `delai_commande_jours`), pas seulement côté client | p.4 | ⬜ |
| U7 | Confirmation commande | Valider la commande | Email de confirmation reçu | p.7 | ⬜ |
| U8 | Historique des commandes | Aller sur `/mon-compte` | Liste de toutes les commandes passées, détail accessible | p.7 | ⬜ |
| U9 | Modification commande | Modifier une commande encore "en attente" (non acceptée) | Tout modifiable sauf le menu, prix recalculé | p.7 | ⬜ |
| U10 | Annulation commande | Annuler une commande non acceptée | Annulation possible et effective | p.7 | ⬜ |
| U11 | Blocage modif après acceptation | Tenter de modifier/annuler une commande "acceptée" | Action bloquée côté interface ET côté serveur | p.7 | ⬜ |
| U12 | Suivi de commande | Consulter une commande acceptée | Historique des statuts avec date/heure de chaque changement | p.7 | ⬜ |
| U13 | Dépôt d'avis | Commande passée "terminée" → recevoir email → se connecter → déposer avis | Note 1-5 + commentaire enregistrés, email reçu déclenchant l'action | p.7 | ⬜ |
| U14 | Modification profil | Modifier nom/adresse/téléphone dans `/mon-compte/profil` | Changements persistés et reflétés sur commande suivante | p.7 | ⬜ |
| U15 | Retour matériel J+10 | Simuler statut "en attente du retour de matériel" (via employé) | Email reçu mentionnant le délai de 10 jours ouvrés et les 600€ | p.8 | ⬜ |

## 3. Rôle Employé

| ID | Parcours | Étapes | Résultat attendu | Réf. CDC | Statut |
|---|---|---|---|---|---|
| E1 | Connexion employé | Se connecter avec un compte créé par l'admin | Accès à l'espace employé, refus si compte désactivé | p.9 | ⬜ |
| E2 | CRUD menus | Créer / modifier / supprimer un menu depuis `/employe/menus` | Changements visibles immédiatement sur `/menus` public | p.8 | ⬜ |
| E3 | CRUD plats | Créer / modifier / supprimer un plat, lui associer des allergènes | Plats disponibles dans le formulaire menu | p.8 | ⬜ |
| E4 | CRUD horaires | Modifier les horaires d'un jour | Reflété sur le pied de page public | p.4, p.8 | ⬜ |
| E5 | Filtre commandes | Filtrer les commandes par statut, puis par client | Résultats corrects et instantanés | p.8 | ⬜ |
| E6 | Changement de statut | Faire progresser une commande : accepté → en préparation → en cours de livraison → livré → terminée | Chaque transition horodatée, visible dans le suivi utilisateur | p.8 | ⬜ |
| E7 | Annulation avec motif | Annuler une commande "acceptée" | Blocage tant que le contact client n'est pas renseigné (mode + motif obligatoires) | p.8 | ⬜ |
| E8 | Validation des avis | Valider un avis en attente | Avis visible sur la page d'accueil publique | p.8 | ⬜ |
| E9 | Refus d'un avis | Refuser un avis | Avis non visible côté public | p.8 | ⬜ |

## 4. Rôle Administrateur

| ID | Parcours | Étapes | Résultat attendu | Réf. CDC | Statut |
|---|---|---|---|---|---|
| A1 | Accès complet employé | Se connecter en admin, effectuer une action employé (ex: CRUD menu) | Toutes les actions employé fonctionnent également pour l'admin | p.9 | ⬜ |
| A2 | Création compte employé | Créer un compte avec email + mot de passe | Employé reçoit un email de notification SANS le mot de passe | p.9 | ⬜ |
| A3 | Désactivation compte employé | Désactiver un compte employé | Connexion bloquée immédiatement pour ce compte | p.9 | ⬜ |
| A4 | Impossibilité de créer un admin | Chercher un moyen de créer un compte "administrateur" depuis l'UI | Aucune option disponible dans l'application | p.9 | ⬜ |
| A5 | Dashboard NoSQL | Aller sur `/admin/dashboard` | Nombre de commandes par menu affiché sous forme de graphique, données issues de MongoDB (pas de Postgres) | p.9 | ⬜ |
| A6 | Filtre CA par menu | Filtrer le CA par menu spécifique | Montant correct correspondant aux commandes terminées de ce menu | p.9 | ⬜ |
| A7 | Filtre CA par durée | Filtrer le CA sur une période (ex: juillet-septembre) | Montant recalculé cohérent avec l'agrégation MongoDB `historiqueMensuel` | p.9 | ⬜ |
| A8 | Cohérence Postgres/MongoDB | Terminer une nouvelle commande, vérifier la synchro | Les stats MongoDB s'incrémentent (nb commandes + CA) sans divergence avec Postgres | p.9 | ⬜ |

## 5. Transverse (tous rôles)

| ID | Parcours | Étapes | Résultat attendu | Réf. CDC | Statut |
|---|---|---|---|---|---|
| T1 | Séparation des rôles | Tenter d'accéder à `/admin` ou `/employe` en étant "utilisateur" ou visiteur | Accès refusé (redirection ou 403), vérifié middleware + RLS | p.4 | ⬜ |
| T2 | RGAA formulaires | Soumettre chaque formulaire (contact, commande, connexion, inscription, modif. commande) avec un champ invalide | Message d'erreur associé au champ via `aria-describedby` | p.9 | ⬜ |
| T3 | Responsive mobile | Rejouer V4, V7, U1 sur viewport mobile (375px) | Mise en page utilisable, pas de débordement horizontal | Charte graphique | ⬜ |
| T4 | Sécurité RLS | Tenter une requête Supabase directe pour accéder aux commandes d'un autre utilisateur (via outils dev / Postman avec le token) | Accès refusé par la RLS | p.9, sécurité | ⬜ |

---

**Instructions d'exécution** : cocher chaque case au fur et à mesure, noter tout écart constaté (capture d'écran + description) directement sous le tableau concerné dans un fichier de suivi séparé ou en commentaire Notion sur le ticket Backlog associé à l'Epic concerné. Toute anomalie bloquante doit être corrigée avant de cocher "Tester chaque parcours utilisateur" dans la Todo Global.
