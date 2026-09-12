# Vite Gourmand

Application web de commande de menus événementiels pour Vite Gourmand, entreprise traiteur bordelaise
(Julie et José). Projet réalisé dans le cadre de l'ECF TP Développeur Web et Web Mobile (Studi).

## Stack technique

- **Front + back** : Next.js (App Router, TypeScript, Tailwind CSS)
- **Base relationnelle** : Supabase (PostgreSQL) + Supabase Auth, projet `vite-gourmand`, région `eu-west-1`
- **Base NoSQL** : MongoDB Atlas, cluster `vite-gourmand`, base `vite_gourmand_stats` (statistiques admin : nb commandes/menu, CA)
- **Déploiement** : Vercel
- **Gestion de projet** : Notion

## Prérequis

- Node.js 18 ou supérieur
- npm
- Un compte Supabase (projet déjà créé pour ce dépôt)
- Un compte MongoDB Atlas (cluster déjà créé pour ce dépôt)

## Installation locale

1. Cloner le dépôt :
   ```bash
   git clone https://github.com/arthurgatoux/vite-gourmand.git
   cd vite-gourmand
   ```

2. Installer les dépendances :
   ```bash
   npm install
   ```

3. Configurer les variables d'environnement : copier `.env.example` vers `.env.local` et renseigner les valeurs
   (voir section suivante).

4. Lancer le serveur de développement :
   ```bash
   npm run dev
   ```
   L'application est accessible sur [http://localhost:3000](http://localhost:3000).

## Variables d'environnement

Créer un fichier `.env.local` à la racine (non versionné, cf. `.gitignore`) avec :

```bash
# Supabase (PostgreSQL relationnel + Auth)
NEXT_PUBLIC_SUPABASE_URL=https://<votre-projet>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<votre-cle-publishable>

# MongoDB Atlas (NoSQL, statistiques admin)
MONGODB_URI=mongodb+srv://<utilisateur>:<mot-de-passe>@vite-gourmand.h1xxlex.mongodb.net/vite_gourmand_stats?appName=vite-gourmand
```

Les clés Supabase sont disponibles dans **Project Settings → API** du tableau de bord Supabase. La chaîne de
connexion MongoDB est disponible via **Connect → Drivers** sur le cluster Atlas.

## Base de données relationnelle (PostgreSQL / Supabase)

Scripts SQL disponibles dans `supabase/sql/` :

- `001_create_schema.sql` : création du schéma (14 tables, 4 types énumérés, Row Level Security activée)
- `002_seed_data.sql` : intégration des données de test (catalogue de menus, plats, régimes, allergènes)

Modèle conceptuel de données détaillé : `docs/MCD-ViteGourmand.md`.

## Base de données NoSQL (MongoDB Atlas)

Script d'initialisation de la collection `stats_menus` (validation, index, documents initiaux) :
`mongodb/init/001_create_stats_menus.js`. Structure détaillée et stratégie de synchronisation :
`docs/NoSQL-MongoDB-ViteGourmand.md`.

## Documentation complémentaire

- `docs/Analyse-Besoins-ViteGourmand.md` — analyse des besoins et reformulation du CDC
- `docs/Charte-Graphique-ViteGourmand.md` — charte graphique (palette, typographies)
- `docs/MCD-ViteGourmand.md` — modèle conceptuel de données relationnel
- `docs/NoSQL-MongoDB-ViteGourmand.md` — structure de la base NoSQL
- `docs/Diagrammes-Utilisation-ViteGourmand.md` — cas d'utilisation par rôle
- `docs/Diagrammes-Sequence-ViteGourmand.md` — parcours critiques
- `docs/RGPD-ViteGourmand.md` — conformité RGPD

## Workflow Git

- `main` : branche de production, stable et déployée.
- `develop` : branche d'intégration, chaque fonctionnalité y est fusionnée après tests.
- `feature/*` : une branche par fonctionnalité, créée depuis `develop`, fusionnée dans `develop` après revue.

## Rôles applicatifs

Visiteur (non authentifié), Utilisateur, Employé, Administrateur. Le rôle Administrateur n'est jamais
attribuable depuis l'application : sa création est exclusivement manuelle (cf. `docs/MCD-ViteGourmand.md`, RG1).
