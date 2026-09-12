# Conformité RGPD — Vite Gourmand

Auteur : Arthur Gatoux (FastDev) — Projet ECF TP Développeur Web et Web Mobile (Studi)

Ce document formalise les dispositions RGPD exigées par le CDC : *"Vous pouvez prendre la liberté de créer
d'autres catégories que vous jugez nécessaires, mais veillez à respecter les aspects réglementaires RGPD et
sécurité."* (CDC-ECF-Studi, page 3). Il complète `docs/Analyse-Besoins-ViteGourmand.md` (section 4.2) en
transformant les intentions en dispositions concrètes et vérifiables.

## 1. Registre simplifié des traitements

| Traitement | Finalité | Base légale | Données concernées | Durée de conservation |
|---|---|---|---|---|
| Création de compte | Gérer l'accès à l'espace utilisateur | Exécution du contrat (Art. 6.1.b) | Nom, prénom, email, téléphone, adresse postale, mot de passe (haché) | Compte actif + 3 ans d'inactivité, puis anonymisation |
| Commande d'un menu | Exécuter la prestation événementielle | Exécution du contrat (Art. 6.1.b) | Infos client, adresse de prestation, historique de statut | 5 ans (durée légale de conservation des documents commerciaux) |
| Avis client | Améliorer la visibilité de l'entreprise | Consentement explicite au dépôt de l'avis | Note, commentaire, prénom affiché | Tant que l'avis est affiché, suppression sur demande |
| Message de contact | Répondre à une demande d'information | Intérêt légitime (réponse à une sollicitation) | Titre, description, email | 12 mois sans suite |
| Mesure d'audience / statistiques admin | Piloter l'activité (nb commandes, CA) | Intérêt légitime de l'entreprise | Données agrégées et anonymisées (`stats_menus`, aucune donnée personnelle) | Illimitée (données non personnelles) |

## 2. Minimisation des données

Conformément au principe de minimisation (Art. 5.1.c RGPD), la table `public.profils` (voir
`docs/MCD-ViteGourmand.md`) ne collecte que : nom, prénom, email, téléphone, adresse postale et mot de passe
haché. Aucune donnée superflue (date de naissance, données bancaires en clair, etc.) n'est demandée à
l'inscription, conformément au strict nécessaire identifié dans le CDC (page 5).

## 3. Durée de conservation et anonymisation

- **Comptes utilisateurs** : anonymisation automatique (remplacement de `nom`, `prenom`, `email`, `telephone`,
  `adresse_postale` par des valeurs génériques, conservation du seul historique de commandes à des fins
  statistiques) après 3 ans sans connexion ni commande. À implémenter via une tâche planifiée (cron Vercel ou
  Edge Function), sur le modèle du job déjà identifié pour les frais de matériel non restitué (RG7).
- **Commandes** : conservées 5 ans, durée de prescription commerciale usuelle, pour couvrir d'éventuels
  litiges liés à la prestation.
- **Messages de contact non traités** : purgés après 12 mois si `traite = false` et aucune suite donnée.
- **Comptes employés désactivés** : conservés pour la traçabilité des actions historiques (RG5 : ne jamais
  supprimer un historique de statut lié), mais l'accès applicatif est bloqué via `compte_actif = false`.

## 4. Droits des personnes concernées

Une page dédiée (accessible depuis l'espace utilisateur et les mentions légales en pied de page) doit exposer :

- **Droit d'accès** : consultation de ses données personnelles directement depuis l'espace utilisateur.
- **Droit de rectification** : formulaire de modification des informations personnelles, déjà prévu au CDC
  (*"un utilisateur [...] peut [...] modifier ses informations personnelles"*).
- **Droit à l'effacement** : demande de suppression de compte via la page de contact ou un email dédié
  (traitement manuel par Julie/José, pas d'automatisation exigée par le CDC).
- **Droit à la portabilité** : export des données au format JSON sur demande.
- **Droit d'opposition** : possibilité de refuser toute communication non essentielle (hors mails
  transactionnels obligatoires : confirmation de commande, changement de statut).

## 5. Sous-traitants et hébergement des données

| Sous-traitant | Rôle | Localisation | Conformité |
|---|---|---|---|
| Supabase (PostgreSQL + Auth) | Hébergement des données relationnelles et authentification | UE (`eu-west-1`, Irlande) | Hébergement en zone UE, pas de transfert hors UE à justifier |
| MongoDB Atlas | Statistiques agrégées non personnelles | UE (à sélectionner explicitement lors de la création du cluster, cf. `docs/NoSQL-MongoDB-ViteGourmand.md`) | Aucune donnée personnelle stockée (uniquement `menu_id`, agrégats) |
| Vercel | Hébergement applicatif | Multi-région, avec fonctions Edge proches de l'UE | À documenter dans la politique de confidentialité |
| Service email transactionnel (Resend) | Envoi des mails automatiques | À vérifier lors du choix définitif du fournisseur | Clause de sous-traitance RGPD à inclure dans les CGV |

## 6. Sécurité des données personnelles (renvoi)

Les mesures de sécurité (hashage du mot de passe par Supabase Auth, Row Level Security, validation Zod,
protection CSRF) sont déjà actées dans `docs/Analyse-Besoins-ViteGourmand.md` (section 4.1) et dans les
diagrammes de séquence (`docs/Diagrammes-Sequence-ViteGourmand.md`, section 5). Ce document RGPD s'y
articule sans dupliquer ce contenu.

## 7. Actions restantes avant mise en production

- Rédiger la politique de confidentialité complète (page dédiée, distincte des mentions légales et des CGV).
- Ajouter une case de consentement explicite si une newsletter est proposée (non exigée par le CDC, à ne
  pas ajouter sans besoin réel).
- Implémenter la tâche planifiée d'anonymisation des comptes inactifs (Phase 4, avec le job de frais RG7).
