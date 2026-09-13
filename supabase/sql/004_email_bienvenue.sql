-- supabase/sql/004_email_bienvenue.sql
-- Vite Gourmand -- Email de bienvenue automatique a l'inscription
--
-- Reference CDC :
-- "Il recevra en reponse a son inscription, un mail de bienvenue de maniere automatique."
--
-- Architecture : la cle API Resend est stockee chiffree dans Supabase Vault
-- (jamais exposee au client ni committee dans le code). L'envoi se fait de
-- maniere asynchrone via pg_net, declenche juste apres la creation du profil
-- (trigger on_auth_user_created -> handle_new_user -> insert profils ->
-- ce trigger). Si la cle n'est pas configuree, l'inscription n'est jamais
-- bloquee : on trace un warning et on continue.
--
-- Prerequis manuel (a executer une seule fois dans le SQL Editor Supabase,
-- avec votre propre cle, jamais committee) :
--   select vault.create_secret('VOTRE_CLE_RESEND', 'resend_api_key');
--
-- Note advisor : l'extension pg_net s'enregistre dans le schema public
-- (limitation connue de cette extension, ALTER EXTENSION ... SET SCHEMA non
-- supporte). Ses fonctions restent neanmoins dans le schema net.* et l'acces
-- a la fonction ci-dessous est revoque pour public/anon/authenticated.

create extension if not exists pg_net;

create or replace function public.envoyer_email_bienvenue()
returns trigger
language plpgsql
security definer
set search_path = public, net, vault
as $$
declare
  cle_api_resend text;
  corps_html text;
begin
  select decrypted_secret into cle_api_resend
  from vault.decrypted_secrets
  where name = 'resend_api_key'
  limit 1;

  if cle_api_resend is null then
    raise warning 'Email de bienvenue non envoye : secret resend_api_key absent du Vault.';
    return new;
  end if;

  corps_html := format(
    '<h1>Bienvenue chez Vite Gourmand, %s !</h1>'
    || '<p>Votre compte vient d''etre cree avec succes. Vous pouvez des a present '
    || 'parcourir nos menus evenementiels et passer commande.</p>'
    || '<p>A tres vite,<br/>Julie et Jose</p>',
    coalesce(new.prenom, '')
  );

  perform net.http_post(
    url := 'https://api.resend.com/emails',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || cle_api_resend,
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'from', 'Vite Gourmand <onboarding@resend.dev>',
      'to', jsonb_build_array(new.email),
      'subject', 'Bienvenue chez Vite Gourmand',
      'html', corps_html
    )
  );

  return new;
end;
$$;

drop trigger if exists on_profil_created_envoyer_bienvenue on public.profils;
create trigger on_profil_created_envoyer_bienvenue
  after insert on public.profils
  for each row
  execute function public.envoyer_email_bienvenue();

revoke execute on function public.envoyer_email_bienvenue() from public, anon, authenticated;
