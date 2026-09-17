-- Migration 017 : bascule de l'expediteur email sur le domaine verifie Resend
-- CDC : emails transactionnels obligatoires (bienvenue, confirmation commande,
-- demande avis, retour materiel). Domaine mail.gatouxweb.com verifie sur Resend
-- (DKIM+SPF+DMARC, region eu-west-1) le 17/09/2026.
-- Remplace onboarding@resend.dev (limite aux tests) par une adresse du domaine
-- verifie dans les 4 fonctions trigger existantes.
-- Applique sur le projet Supabase vite-gourmand (rxgwaemvocsyysakljdk) via le connecteur MCP le 17/09/2026.

create or replace function public.envoyer_email_bienvenue()
returns trigger language plpgsql security definer set search_path = public, net, vault as $$
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
    || '<p>Votre compte vient d''''etre cree avec succes. Vous pouvez des a present '
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
      'from', 'Vite Gourmand <commandes@mail.gatouxweb.com>',
      'to', jsonb_build_array(new.email),
      'subject', 'Bienvenue chez Vite Gourmand',
      'html', corps_html
    )
  );

  return new;
end;
$$;

create or replace function public.apres_creation_commande()
returns trigger language plpgsql security definer set search_path = public, net, vault as $$
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
      'from', 'Vite Gourmand <commandes@mail.gatouxweb.com>',
      'to', jsonb_build_array(new.email_client),
      'subject', 'Confirmation de votre commande Vite Gourmand',
      'html', corps_html
    )
  );

  return new;
end;
$$;

create or replace function public.envoyer_email_demande_avis()
returns trigger language plpgsql security definer set search_path = public, net, vault as $$
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
      'from', 'Vite Gourmand <commandes@mail.gatouxweb.com>',
      'to', jsonb_build_array(new.email_client),
      'subject', 'Donnez votre avis sur votre commande Vite Gourmand',
      'html', corps_html
    )
  );

  return new;
end;
$$;

create or replace function public.demarrer_retour_materiel()
returns trigger language plpgsql security definer set search_path = public, net, vault as $$
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
      'from', 'Vite Gourmand <commandes@mail.gatouxweb.com>',
      'to', jsonb_build_array(new.email_client),
      'subject', 'Retour de materiel a prevoir - Vite Gourmand',
      'html', corps_html
    )
  );

  return new;
end;
$$;
