-- Ticket E5 : Modification et annulation de commande avant acceptation
-- CDC : "L'annulation de commande est possible, tant qu'un employe n'a pas
-- passe la commande en accepte, la modification est egalement possible
-- tout est modifiable, sauf le choix du menu [...] le suivi de la commande
-- enumere tous les etats de sa commande suivi de la date et l'heure de modification."

-- 1. Le recalcul du prix (deja actif a la creation) doit aussi s'appliquer
--    quand l'utilisateur modifie nb_personnes ou la distance avant acceptation.
create or replace function public.calculer_prix_commande()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_menu record;
begin
  select prix_base, nb_personnes_min, stock_disponible, actif
  into v_menu
  from public.menus
  where id = new.menu_id;

  if not found or not v_menu.actif then
    raise exception 'Ce menu n''est plus disponible.';
  end if;

  if new.nb_personnes < v_menu.nb_personnes_min then
    raise exception 'Le nombre de personnes minimum pour ce menu est %.', v_menu.nb_personnes_min;
  end if;

  if tg_op = 'INSERT' and v_menu.stock_disponible <= 0 then
    raise exception 'Ce menu n''est plus disponible a la commande (stock epuise).';
  end if;

  if new.nb_personnes >= v_menu.nb_personnes_min + 5 then
    new.reduction_pourcentage := 10;
  else
    new.reduction_pourcentage := 0;
  end if;

  new.prix_menu := v_menu.prix_base * new.nb_personnes * (1 - new.reduction_pourcentage / 100.0);

  new.distance_km := coalesce(new.distance_km, 0);
  new.prix_livraison := 5 + (new.distance_km * 0.59);

  new.prix_total := new.prix_menu + new.prix_livraison;

  if tg_op = 'INSERT' then
    new.utilisateur_id := auth.uid();
    new.statut_courant := 'en_attente';
  end if;

  return new;
end;
$function$;

drop trigger if exists before_commande_update_prix on public.commandes;
create trigger before_commande_update_prix
  before update on public.commandes
  for each row
  when (old.nb_personnes is distinct from new.nb_personnes or old.distance_km is distinct from new.distance_km)
  execute function public.calculer_prix_commande();

-- 2. Historique automatique a chaque changement de statut (annulation utilisateur,
--    puis plus tard accepte/en_preparation/etc. pour l'espace employe).
create or replace function public.apres_changement_statut_commande()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  insert into public.historique_statut_commande (commande_id, statut)
  values (new.id, new.statut_courant);
  return new;
end;
$function$;

drop trigger if exists after_commande_changement_statut on public.commandes;
create trigger after_commande_changement_statut
  after update on public.commandes
  for each row
  when (old.statut_courant is distinct from new.statut_courant)
  execute function public.apres_changement_statut_commande();
