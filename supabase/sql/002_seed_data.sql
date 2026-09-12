-- Vite Gourmand - Donnees de test (catalogue)
-- Les comptes utilisateurs (auth.users + profils) sont crees via Supabase Auth (sign-up), pas en SQL brut.

insert into public.regimes (nom) values
  ('classique'), ('vegetarien'), ('vegan');

insert into public.allergenes (nom) values
  ('gluten'), ('lactose'), ('fruits a coque'), ('arachide'), ('oeuf'), ('poisson'), ('crustaces'), ('soja');

insert into public.plats (nom, description, type_plat) values
  ('Foie gras maison', 'Foie gras mi-cuit, chutney de figues', 'entree'),
  ('Veloute de chataigne', 'Veloute de chataigne et copeaux de noix', 'entree'),
  ('Chapon farci', 'Chapon farci aux marrons, sauce forestiere', 'plat'),
  ('Filet de bar', 'Filet de bar, legumes de saison', 'plat'),
  ('Buche de Noel', 'Buche chocolat-praline', 'dessert'),
  ('Salade de fruits exotiques', 'Fruits frais de saison', 'dessert');

insert into public.menus (titre, description, theme, prix_base, nb_personnes_min, conditions, delai_commande_jours, stock_disponible, actif) values
  ('Menu de Noel Traditionnel', 'Un menu chaleureux pour les fetes de fin d annee', 'noel', 45.00, 6, 'Commande 7 jours avant la prestation minimum', 7, 20, true),
  ('Menu Vegetarien Fetes', 'Une alternative vegetarienne gourmande pour les fetes', 'noel', 40.00, 4, 'Commande 5 jours avant la prestation minimum', 5, 15, true);

-- Associations menu <-> plats (exemple pour le menu de Noel traditionnel)
insert into public.menu_plat (menu_id, plat_id)
select m.id, p.id from public.menus m, public.plats p
where m.titre = 'Menu de Noel Traditionnel' and p.nom in ('Foie gras maison', 'Chapon farci', 'Buche de Noel');

insert into public.menu_plat (menu_id, plat_id)
select m.id, p.id from public.menus m, public.plats p
where m.titre = 'Menu Vegetarien Fetes' and p.nom in ('Veloute de chataigne', 'Filet de bar', 'Salade de fruits exotiques');

-- Allergenes des plats
insert into public.plat_allergene (plat_id, allergene_id)
select p.id, a.id from public.plats p, public.allergenes a
where p.nom = 'Foie gras maison' and a.nom = 'fruits a coque';

insert into public.plat_allergene (plat_id, allergene_id)
select p.id, a.id from public.plats p, public.allergenes a
where p.nom = 'Chapon farci' and a.nom = 'fruits a coque';

-- Regimes des menus
insert into public.menu_regime (menu_id, regime_id)
select m.id, r.id from public.menus m, public.regimes r
where m.titre = 'Menu de Noel Traditionnel' and r.nom = 'classique';

insert into public.menu_regime (menu_id, regime_id)
select m.id, r.id from public.menus m, public.regimes r
where m.titre = 'Menu Vegetarien Fetes' and r.nom = 'vegetarien';

-- Galerie d images (exemple)
insert into public.menu_images (menu_id, url, ordre)
select id, 'https://placeholder.vite-gourmand.fr/menu-noel-1.jpg', 1 from public.menus where titre = 'Menu de Noel Traditionnel';
