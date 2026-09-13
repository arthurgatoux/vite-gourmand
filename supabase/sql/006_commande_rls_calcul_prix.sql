-- supabase/sql/006_commande_rls_calcul_prix.sql
-- Vite Gourmand -- Parcours de commande : colonne statut, calcul serveur du prix,
-- controle du stock et du minimum de personnes, RLS, email de confirmation.
--
-- Reference CDC :
-- "il y a l'obligation de commander pour le nombre minimum de personne inscrit dans
-- le menu." / "une reduction de 10% est appliquee pour toutes commandes ayant 5
-- personnes de plus que le nombre de personnes minimum indique dans le menu." (RG2)
-- "facturation de 5 euros majore de 59 centimes par kilometre parcouru si la
-- livraison n'est pas dans la ville de bordeaux." (RG3)
-- "Apres avoir commande un menu, le visiteur va recevoir un mail lui confirmant
-- la commande."
--
-- Choix de gestion (a confirmer/documenter) : le prix du menu est calcule au
-- prorata du nombre de personnes (prix_base * nb_personnes), le CDC ne
-- precisant pas explicitement la formule au-dela du minimum.

alter table public.commandes
  add column if not exists statut_courant statut_commande not null default 'en_attente';

create or replace function public.calculer_prix_commande()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
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

  if v_menu.stock_disponible <= 0 then
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

  new.utilisateur_id := auth.uid();
  new.statut_courant := 'en_attente';

  return new;
end;
$$;

drop trigger if exists before_commande_calcul_prix on public.commandes;
create trigger before_commande_calcul_prix
  before insert on public.commandes
  for each row
  execute function public.calculer_prix_commande();

create or replace function public.empecher_changement_menu_commande()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.menu_id is distinct from old.menu_id then
    raise exception 'Le menu de la commande ne peut pas etre modifie.';
  end if;
  return new;
end;
$$;

drop trigger if exists before_commande_update_menu on public.commandes;
create trigger before_commande_update_menu
  before update on public.commandes
  for each row
  execute function public.empecher_changement_menu_commande();

create or replace function public.apres_creation_commande()
returns trigger
language plpgsql
security definer
set search_path = public, net, vault
as $$
declare
  cle_api_resend text;
  corps_html text;
begin
  update public.menus
  set stock_disponible = stock_disponible - 1
  where id = new.menu_id;

  insert into public.historique_statut_commande (commande_id, statut)
  values (new.id, 'en_attente');

  select decrypted_secret into cle_api_resend
  from vault.decrypted_secrets where name = 'resend_api_key' limit 1;

  if cle_api_resend is null then
    raise warning 'Email de confirmation non envoye : secret resend_api_key absent du Vault.';
    return new;
  end if;

  corps_html := format(
    '<h1>Votre commande Vite Gourmand est confirmee</h1>'
    || '<p>Prestation prevue le %s a %s.</p>'
    || '<p>Nombre de personnes : %s</p>'
    || '<p>Prix menu : %s EUR - Livraison : %s EUR - Total : %s EUR</p>'
    || '<p>Nous revenons vers vous rapidement pour confirmer les details.</p>',
    new.date_prestation, new.heure_livraison, new.nb_personnes,
    new.prix_menu, new.prix_livraison, new.prix_total
  );

  perform net.http_post(
    url := 'https://api.resend.com/emails',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || cle_api_resend,
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'from', 'Vite Gourmand <onboarding@resend.dev>',
      'to', jsonb_build_array(new.email_client),
      'subject', 'Confirmation de votre commande Vite Gourmand',
      'html', corps_html
    )
  );

  return new;
end;
$$;

drop trigger if exists after_commande_creation on public.commandes;
create trigger after_commande_creation
  after insert on public.commandes
  for each row
  execute function public.apres_creation_commande();

create policy "utilisateur_cree_sa_commande"
  on public.commandes for insert
  to authenticated
  with check (auth.uid() is not null);

create policy "utilisateur_lit_ses_commandes"
  on public.commandes for select
  to authenticated
  using (
    utilisateur_id = auth.uid()
    or exists (select 1 from public.profils p where p.id = auth.uid() and p.role in ('employe', 'administrateur'))
  );

create policy "utilisateur_modifie_sa_commande_en_attente"
  on public.commandes for update
  to authenticated
  using (utilisateur_id = auth.uid() and statut_courant = 'en_attente')
  with check (utilisateur_id = auth.uid());

create policy "employe_admin_modifient_toutes_commandes"
  on public.commandes for update
  to authenticated
  using (exists (select 1 from public.profils p where p.id = auth.uid() and p.role in ('employe', 'administrateur')));

create policy "lecture_historique_commande_concernee"
  on public.historique_statut_commande for select
  to authenticated
  using (
    exists (
      select 1 from public.commandes c
      where c.id = historique_statut_commande.commande_id
        and (c.utilisateur_id = auth.uid()
             or exists (select 1 from public.profils p where p.id = auth.uid() and p.role in ('employe', 'administrateur')))
    )
  );

revoke execute on function public.calculer_prix_commande() from public, anon, authenticated;
revoke execute on function public.apres_creation_commande() from public, anon, authenticated;
revoke execute on function public.empecher_changement_menu_commande() from public, anon, authenticated;
