-- Ticket E5 : Depot d'un avis (note + commentaire) apres commande terminee
-- CDC : "Quand la commande est terminee, alors, l'utilisateur est notifie par mail
-- qu'il peut se connecter a son compte pour donner son avis depuis la commande.
-- Il doit pouvoir donner entre note entre 1 et 5, suivi d'un commentaire."

-- 1. Un seul avis par commande.
alter table public.avis
  add constraint avis_commande_id_unique unique (commande_id);

-- 2. L'utilisateur peut deposer un avis uniquement sur sa propre commande terminee.
create policy "utilisateur_depose_avis_commande_terminee"
  on public.avis
  for insert
  with check (
    utilisateur_id = auth.uid()
    and exists (
      select 1 from public.commandes c
      where c.id = avis.commande_id
        and c.utilisateur_id = auth.uid()
        and c.statut_courant = 'termine'
    )
  );

-- 3. L'utilisateur peut relire son propre avis (valide ou non), en plus des avis publics valides deja lisibles.
create policy "utilisateur_lit_son_avis"
  on public.avis
  for select
  using (utilisateur_id = auth.uid());

-- 4. Email automatique quand une commande passe au statut 'termine', invitant a laisser un avis.
create or replace function public.envoyer_email_demande_avis()
returns trigger
language plpgsql
security definer
set search_path to 'public', 'net', 'vault'
as $function$
declare
  cle_api_resend text;
  corps_html text;
begin
  select decrypted_secret into cle_api_resend
  from vault.decrypted_secrets
  where name = 'resend_api_key'
  limit 1;

  if cle_api_resend is null then
    raise warning 'Email de demande avis non envoye : secret resend_api_key absent du Vault.';
    return new;
  end if;

  corps_html := format(
    '<h1>Votre commande Vite Gourmand est terminee</h1>'
    || '<p>Bonjour %s,</p>'
    || '<p>Votre prestation du %s est maintenant terminee. Nous esperons que vous avez passe un bon moment !</p>'
    || '<p>Connectez-vous a votre compte pour laisser une note et un commentaire sur cette commande.</p>'
    || '<p>A tres vite,<br/>Julie et Jose</p>',
    coalesce(new.prenom_client, ''), new.date_prestation
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
      'subject', 'Donnez votre avis sur votre commande Vite Gourmand',
      'html', corps_html
    )
  );

  return new;
end;
$function$;

drop trigger if exists after_commande_terminee_demande_avis on public.commandes;
create trigger after_commande_terminee_demande_avis
  after update on public.commandes
  for each row
  when (new.statut_courant = 'termine' and old.statut_courant is distinct from new.statut_courant)
  execute function public.envoyer_email_demande_avis();
