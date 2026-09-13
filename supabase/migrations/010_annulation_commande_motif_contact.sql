-- Ticket E6 : Annulation de commande avec motif et mode de contact
--
-- CDC (page 8) : "il ne peut pas modifier/annuler les commandes avant
-- d'avoir contacte le client par appel GSM ou mail. Il devra mettre un
-- motif d'annulation en specifiant le mode de contact ainsi que le motif."
--
-- RG5 (deja documente dans MCD-ViteGourmand.md) : aucune mutation destructive
-- de l'historique - chaque changement de statut cree une nouvelle ligne,
-- jamais d'UPDATE apres coup. Le motif et le mode de contact doivent donc
-- etre ecrits dans la MEME transaction que le changement de statut.
--
-- Choix d'architecture : transit par des variables de session Postgres
-- (set_config(..., true) => portee locale a la transaction), lues par le
-- trigger existant apres_changement_statut_commande, plutot que par une
-- deuxieme ecriture sur historique_statut_commande.

create or replace function public.apres_changement_statut_commande()
returns trigger
language plpgsql
security definer
set search_path to public
as $function$
begin
  insert into public.historique_statut_commande (commande_id, statut, motif_annulation, mode_contact_client)
  values (
    new.id,
    new.statut_courant,
    current_setting('app.motif_annulation', true),
    current_setting('app.mode_contact_client', true)
  );
  return new;
end;
$function$;

-- Fonction transactionnelle dediee a l'annulation employe : garantit que
-- le motif et le mode de contact arrivent toujours dans la meme ligne
-- d'historique que le changement de statut, sans jamais permettre de
-- reecrire l'historique apres coup (RG5).
create or replace function public.employe_annuler_commande(
  p_commande_id uuid,
  p_motif text,
  p_mode_contact text
)
returns void
language plpgsql
security definer
set search_path to public
as $function$
begin
  if not public.est_employe_ou_admin() then
    raise exception 'Action reservee aux employes et administrateurs.';
  end if;

  if p_motif is null or length(trim(p_motif)) = 0 then
    raise exception 'Le motif d''annulation est obligatoire.';
  end if;

  if p_mode_contact is null or length(trim(p_mode_contact)) = 0 then
    raise exception 'Le mode de contact est obligatoire.';
  end if;

  perform set_config('app.motif_annulation', p_motif, true);
  perform set_config('app.mode_contact_client', p_mode_contact, true);

  update public.commandes
  set statut_courant = 'annule'
  where id = p_commande_id;

  if not found then
    raise exception 'Commande introuvable.';
  end if;
end;
$function$;

-- Cette fonction DOIT rester appelable par authenticated : c'est le point
-- d'entree RPC des employes. Le controle de role se fait a l'interieur
-- (est_employe_ou_admin), pas au niveau du GRANT.
revoke execute on function public.employe_annuler_commande from public, anon;
grant execute on function public.employe_annuler_commande to authenticated;
