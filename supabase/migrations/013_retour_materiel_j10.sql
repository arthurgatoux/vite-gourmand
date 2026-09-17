-- Ticket E6 : Gestion du retour de materiel prete avec notification J+10
-- CDC (page 8) : "en attente du retour de materiel si du materiel a ete
-- prete au client [...] des que ce statut est atteint, le client recoit un
-- mail lui notifiant que si sous 10 jours ouvres, le materiel n'est pas
-- restitue, alors il devra s'acquitter de 600 euros de frais [...] termine
-- soit quand la commande est livree sans pret de materiel, soit quand le
-- materiel a ete restitue."

-- 1. RLS manquante sur prets_materiel (RLS activee, 0 policy avant cette migration).
create policy employe_admin_lisent_prets_materiel
on public.prets_materiel
for select
to authenticated
using (public.est_employe_ou_admin());

create policy employe_admin_gerent_prets_materiel
on public.prets_materiel
for update
to authenticated
using (public.est_employe_ou_admin())
with check (public.est_employe_ou_admin());

-- 2. Calcul de N jours ouvres (lundi-vendredi) a partir d'une date.
create or replace function public.ajouter_jours_ouvres(date_depart date, nb_jours integer)
returns date
language plpgsql
immutable
as $function$
declare
  jours_ajoutes integer := 0;
  date_courante date := date_depart;
begin
  while jours_ajoutes < nb_jours loop
    date_courante := date_courante + 1;
    if extract(isodow from date_courante) < 6 then
      jours_ajoutes := jours_ajoutes + 1;
    end if;
  end loop;
  return date_courante;
end;
$function$;

-- 3. Au passage du statut a attente_retour_materiel (seulement si du
-- materiel a effectivement ete prete), cree la ligne de suivi et notifie
-- le client par email.
create or replace function public.demarrer_retour_materiel()
returns trigger
language plpgsql
security definer
set search_path to public, net, vault
as $function$
declare
  cle_api_resend text;
  corps_html text;
  date_limite date;
begin
  if not new.materiel_prete then
    return new;
  end if;

  date_limite := public.ajouter_jours_ouvres(current_date, 10);

  insert into public.prets_materiel (commande_id, description_materiel, date_pret, date_limite_retour)
  values (new.id, 'Materiel prete pour la prestation du ' || new.date_prestation, current_date, date_limite);

  select decrypted_secret into cle_api_resend from vault.decrypted_secrets where name = 'resend_api_key' limit 1;
  if cle_api_resend is null then
    raise warning 'Email de retour materiel non envoye : secret resend_api_key absent du Vault.';
    return new;
  end if;

  corps_html := format(
    '<h1>Retour du materiel a prevoir</h1><p>Bonjour %s,</p><p>Du materiel vous a ete prete pour votre prestation du %s. Merci de le restituer avant le %s.</p><p>Passe ce delai de 10 jours ouvres, des frais de 600 EUR seront appliques, conformement a nos conditions generales de vente.</p><p>Pour organiser la restitution, merci de reprendre contact avec nous.</p><p>A tres vite,<br>Julie et Jose</p>',
    coalesce(new.prenom_client, ''), new.date_prestation, date_limite
  );

  perform net.http_post(
    url := 'https://api.resend.com/emails',
    headers := jsonb_build_object('Authorization', 'Bearer ' || cle_api_resend, 'Content-Type', 'application/json'),
    body := jsonb_build_object(
      'from', 'Vite Gourmand <onboarding@resend.dev>',
      'to', jsonb_build_array(new.email_client),
      'subject', 'Retour de materiel a prevoir - Vite Gourmand',
      'html', corps_html
    )
  );

  return new;
end;
$function$;

drop trigger if exists apres_passage_attente_retour_materiel on public.commandes;
create trigger apres_passage_attente_retour_materiel
after update on public.commandes
for each row
when (new.statut_courant = 'attente_retour_materiel' and old.statut_courant is distinct from new.statut_courant)
execute function public.demarrer_retour_materiel();

revoke execute on function public.demarrer_retour_materiel from public, anon, authenticated;

-- 4. RG7 : application des frais de 600 EUR en cas de non-restitution sous
-- 10 jours ouvres. Destinee a etre appelee par une tache planifiee (Vercel
-- Cron, Phase 6) -- pas encore de cron deploye a ce stade, mais la logique
-- metier est prete et testable des maintenant.
create or replace function public.appliquer_frais_retard_materiel()
returns integer
language plpgsql
security definer
set search_path to public
as $function$
declare
  nb_maj integer;
begin
  if not public.est_employe_ou_admin() then
    raise exception 'Action reservee aux employes et administrateurs.';
  end if;

  update public.prets_materiel
  set frais_appliques = true
  where restitue = false
    and frais_appliques = false
    and date_limite_retour < current_date;

  get diagnostics nb_maj = row_count;
  return nb_maj;
end;
$function$;

revoke execute on function public.appliquer_frais_retard_materiel from public, anon;
grant execute on function public.appliquer_frais_retard_materiel to authenticated;
