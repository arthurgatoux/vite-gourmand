-- Vite Gourmand - Schema relationnel PostgreSQL (Supabase)
-- Genere a partir du MCD valide (docs/MCD-ViteGourmand.md)

create extension if not exists pgcrypto;

create type role_utilisateur as enum ('utilisateur', 'employe', 'administrateur');
create type type_plat as enum ('entree', 'plat', 'dessert');
create type statut_avis as enum ('en_attente', 'valide', 'refuse');
create type statut_commande as enum ('en_attente', 'accepte', 'en_preparation', 'en_livraison', 'livre', 'attente_retour_materiel', 'termine', 'annule');

-- Profil applicatif, lie 1-1 a auth.users (Supabase Auth gere le mot de passe)
create table public.profils (
  id uuid primary key references auth.users(id) on delete cascade,
  nom text not null,
  prenom text not null,
  email text not null unique,
  telephone text,
  adresse_postale text,
  role role_utilisateur not null default 'utilisateur',
  compte_actif boolean not null default true,
  date_creation timestamptz not null default now()
);

create table public.menus (
  id uuid primary key default gen_random_uuid(),
  titre text not null,
  description text,
  theme text,
  prix_base numeric(10,2) not null check (prix_base >= 0),
  nb_personnes_min integer not null check (nb_personnes_min > 0),
  conditions text,
  delai_commande_jours integer default 0,
  stock_disponible integer default 0,
  actif boolean not null default true
);
create index idx_menus_theme on public.menus(theme);
create index idx_menus_prix on public.menus(prix_base);
create index idx_menus_nb_personnes on public.menus(nb_personnes_min);

create table public.menu_images (
  id uuid primary key default gen_random_uuid(),
  menu_id uuid not null references public.menus(id) on delete cascade,
  url text not null,
  ordre integer not null default 0
);

create table public.plats (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  description text,
  type_plat type_plat not null
);

create table public.allergenes (
  id uuid primary key default gen_random_uuid(),
  nom text not null unique
);

create table public.regimes (
  id uuid primary key default gen_random_uuid(),
  nom text not null unique
);

create table public.menu_plat (
  menu_id uuid not null references public.menus(id) on delete cascade,
  plat_id uuid not null references public.plats(id) on delete cascade,
  primary key (menu_id, plat_id)
);

create table public.plat_allergene (
  plat_id uuid not null references public.plats(id) on delete cascade,
  allergene_id uuid not null references public.allergenes(id) on delete cascade,
  primary key (plat_id, allergene_id)
);

create table public.menu_regime (
  menu_id uuid not null references public.menus(id) on delete cascade,
  regime_id uuid not null references public.regimes(id) on delete cascade,
  primary key (menu_id, regime_id)
);

create table public.commandes (
  id uuid primary key default gen_random_uuid(),
  utilisateur_id uuid not null references public.profils(id),
  menu_id uuid not null references public.menus(id),
  nom_client text not null,
  prenom_client text not null,
  email_client text not null,
  telephone_client text not null,
  adresse_prestation text not null,
  date_prestation date not null,
  heure_livraison time not null,
  nb_personnes integer not null,
  distance_km numeric(6,2) default 0,
  prix_menu numeric(10,2) not null,
  prix_livraison numeric(10,2) not null default 5,
  reduction_pourcentage numeric(5,2) not null default 0,
  prix_total numeric(10,2) not null,
  materiel_prete boolean not null default false,
  date_creation timestamptz not null default now()
);
create index idx_commandes_utilisateur on public.commandes(utilisateur_id);
create index idx_commandes_menu on public.commandes(menu_id);

create table public.historique_statut_commande (
  id uuid primary key default gen_random_uuid(),
  commande_id uuid not null references public.commandes(id) on delete cascade,
  statut statut_commande not null,
  date_changement timestamptz not null default now(),
  motif_annulation text,
  mode_contact_client text
);
create index idx_historique_commande on public.historique_statut_commande(commande_id);

create table public.prets_materiel (
  id uuid primary key default gen_random_uuid(),
  commande_id uuid not null references public.commandes(id) on delete cascade,
  description_materiel text not null,
  date_pret date not null,
  date_limite_retour date not null,
  restitue boolean not null default false,
  frais_appliques boolean not null default false
);

create table public.avis (
  id uuid primary key default gen_random_uuid(),
  commande_id uuid not null references public.commandes(id) on delete cascade,
  utilisateur_id uuid not null references public.profils(id),
  note integer not null check (note between 1 and 5),
  commentaire text,
  statut_validation statut_avis not null default 'en_attente',
  date_creation timestamptz not null default now()
);

create table public.messages_contact (
  id uuid primary key default gen_random_uuid(),
  titre text not null,
  description text not null,
  email text not null,
  date_creation timestamptz not null default now(),
  traite boolean not null default false
);

-- RLS active par defaut sur toutes les tables ; policies detaillees a l'etape E9
alter table public.profils enable row level security;
alter table public.menus enable row level security;
alter table public.menu_images enable row level security;
alter table public.plats enable row level security;
alter table public.allergenes enable row level security;
alter table public.regimes enable row level security;
alter table public.menu_plat enable row level security;
alter table public.plat_allergene enable row level security;
alter table public.menu_regime enable row level security;
alter table public.commandes enable row level security;
alter table public.historique_statut_commande enable row level security;
alter table public.prets_materiel enable row level security;
alter table public.avis enable row level security;
alter table public.messages_contact enable row level security;
