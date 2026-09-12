# Vite & Gourmand

Application web de commande de menus événementiels pour l'entreprise traiteur bordelaise Vite & Gourmand (Julie et José). Projet réalisé dans le cadre de l'ECF TP Développeur Web et Web Mobile (Studi) par Arthur Gatoux, FastDev.

## Sommaire

- [Présentation](#présentation)
- [Stack technique](#stack-technique)
- [Architecture](#architecture)
- [Prérequis](#prérequis)
- [Installation locale](#installation-locale)
- [Base de données relationnelle (Supabase / PostgreSQL)](#base-de-données-relationnelle-supabase--postgresql)
- [Base de données NoSQL (MongoDB Atlas)](#base-de-données-nosql-mongodb-atlas)
- [Lancer le projet en local](#lancer-le-projet-en-local)
- [Structure du dépôt](#structure-du-dépôt)
- [Workflow Git](#workflow-git)
- [Rôles et parcours de test](#rôles-et-parcours-de-test)
- [Documentation et gestion de projet](#documentation-et-gestion-de-projet)
- [Déploiement](#déploiement)

## Présentation

L'application permet de présenter les menus événementiels de l'entreprise, de les commander en ligne, avec un calcul dynamique du prix, des réductions et des frais de livraison, et propose quatre espaces distincts : visiteur, utilisateur, employé et administrateur. Un dashboard statistique (nombre de commandes par menu, chiffre d'affaires) est alimenté par une base NoSQL dédiée.

## Stack technique

| Composant | Technologie | Justification résumée |
|---|---|---|
| Front et back-end | Next.js 15 (App Router, TypeScript, Tailwind CSS) | Un seul framework full-stack, Server Actions natives, rendu hybride SSR/CSR adapté au filtrage dynamique exigé par le CDC |
| Base relationnelle | Supabase (PostgreSQL managé, région `eu-west-1`) | SQL standard (exigence explicite du CDC concernant les fichiers SQL de création et d'intégration), Row Level Security native, hébergement en zone UE pour le RGPD |
| Authentification | Supabase Auth | Gestion sécurisée du hachage de mot de passe, tokens de confirmation et de réinitialisation par mail, intégration native avec RLS |
| Base NoSQL | MongoDB Atlas | Exigée par le CDC pour le dashboard admin (nombre de commandes par menu, chiffre d'affaires) |
| Déploiement | Vercel | Intégration continue avec GitHub, adapté à Next.js |
| Gestion de projet | Notion | Backlog (50 user stories réparties en épics E1 à E10) et documentation |
| Versioning | GitHub (dépôt public `vite-gourmand`) | Exigence du CDC : dépôt public, workflow `main`, `develop` et `feature/*` |

## Architecture

```
Navigateur
   │
   ▼
Next.js (Vercel) : Server Actions et Route Handlers
   │                          │
   ▼                          ▼
Supabase Auth          Supabase PostgreSQL (RLS)
   │                          │
   └──────────► Synchronisation applicative ─────► MongoDB Atlas (statistiques agrégées)
```

La synchronisation vers MongoDB est déclenchée applicativement (Server Action) à chaque changement de statut de commande vers « terminée », plutôt que recalculée à la volée sur PostgreSQL (voir `docs/MCD-ViteGourmand.md`, section 3).

## Prérequis

- Node.js version 20 ou supérieure
- npm (ou pnpm, ou yarn)
- Un compte Supabase avec accès au projet `vite-gourmand`
- Un cluster MongoDB Atlas (base `vite-gourmand-stats`)
- Git

## Installation locale

```bash
# 1. Cloner le dépôt
git clone https://github.com/arthurgatoux/vite-gourmand.git
cd vite-gourmand

# 2. Se placer sur la branche develop (branche d'intégration)
git checkout develop

# 3. Installer les dépendances
npm install

# 4. Configurer les variables d'environnement
cp .env.example .env.local
```

Renseigner dans `.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=<url du projet Supabase>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<clé publishable ou anon>
SUPABASE_SECRET_KEY=<clé secrète Supabase, usage serveur uniquement, jamais exposée au client>
MONGODB_URI=<chaîne de connexion MongoDB Atlas>
MONGODB_DB_NAME=vite-gourmand-stats
```

Les clés Supabase sont disponibles dans « Project Settings > API » du dashboard Supabase du projet `vite-gourmand`.

## Base de données relationnelle (Supabase / PostgreSQL)

Le schéma complet et les données de test sont fournis en SQL brut, conformément à l'exigence explicite du CDC selon laquelle les fichiers de création et d'intégration de données doivent être des fichiers SQL :

```bash
supabase/sql/001_create_schema.sql   # 14 tables, 4 enums, contraintes, index, activation RLS
supabase/sql/002_seed_data.sql       # jeu de données de test (menus, plats, allergènes, régimes)
```

Pour appliquer ces scripts sur votre propre instance Supabase, via l'éditeur SQL du dashboard, ou via la CLI Supabase :

```bash
supabase db execute --file supabase/sql/001_create_schema.sql
supabase db execute --file supabase/sql/002_seed_data.sql
```

Le modèle conceptuel de données (MCD), le diagramme Mermaid et les règles de gestion (RG1 à RG7) sont documentés dans [`docs/MCD-ViteGourmand.md`](./docs/MCD-ViteGourmand.md).

Les comptes utilisateurs (`auth.users` combiné à `public.profils`) sont créés via le flux Supabase Auth, lors de l'inscription applicative, jamais par insertion SQL directe.

## Base de données NoSQL (MongoDB Atlas)

Collection `stats_menus`, alimentée par synchronisation applicative à chaque commande terminée. Structure documentée dans `docs/MCD-ViteGourmand.md`, section 3.

## Lancer le projet en local

```bash
npm run dev
```

L'application est accessible à l'adresse http://localhost:3000.

## Structure du dépôt

```
app/                  Routes Next.js (App Router)
components/            Composants React réutilisables (UI et métier)
docs/                  Documentation technique (MCD, etc.)
lib/                   Clients Supabase (browser et server), utilitaires
supabase/sql/          Scripts SQL de création et de seed
```

## Workflow Git

Conformément au CDC, le dépôt applique le workflow suivant :

- `main` : branche de production, stable, déployée.
- `develop` : branche d'intégration, testée avant chaque merge vers `main`.
- `feature/*` : une branche par fonctionnalité, créée depuis `develop`. Après tests, merge vers `develop`. Une fois `develop` validée, merge vers `main`.

```bash
git checkout develop
git checkout -b feature/nom-de-la-fonctionnalite
# développement de la fonctionnalité
git push origin feature/nom-de-la-fonctionnalite
# Pull Request vers develop, puis merge après tests
```

## Rôles et parcours de test

Les identifiants de test par rôle (visiteur, utilisateur, employé, administrateur) seront fournis dans le manuel d'utilisation en PDF livré en fin de projet.

## Documentation et gestion de projet

La gestion de projet et la documentation technique complète (choix technologiques, MCD, diagrammes de classes, cas d'usage, séquence, déploiement) sont centralisées dans l'espace Notion du projet.

## Déploiement

Déploiement cible : Vercel, connecté au dépôt GitHub sur la branche `main`. La procédure détaillée sera documentée dans `docs/` lors de la phase de déploiement.
