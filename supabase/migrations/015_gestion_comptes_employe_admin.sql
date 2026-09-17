-- Ticket E1 : Creation et desactivation de comptes employe par l'administrateur
-- CDC page 9 : l'administrateur peut creer un compte employe (email + mot de
-- passe qu'il fournit lui-meme) et rendre inutilisable un compte employe.
-- RG1 (deja en place, migration 003) : le role administrateur reste
-- impossible a atteindre via l'application. Ces fonctions ne permettent
-- jamais de definir le role administrateur, uniquement employe, et
-- uniquement si l'appelant est deja administrateur.
--
-- Meme pattern de securite que employe_annuler_commande (migration 010) :
-- fonction SECURITY DEFINER, controle du role fait a l'interieur de la
-- fonction (pas au niveau du GRANT), revoke public/anon, grant authenticated.

create or replace function public.admin_activer_role_employe(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.profils where id = auth.uid() and role = 'administrateur'
  ) then
    raise exception 'Action reservee aux administrateurs.';
  end if;

  update public.profils
  set role = 'employe'
  where id = p_user_id
    and role = 'utilisateur';

  if not found then
    raise exception 'Compte introuvable ou deja affecte a un role.';
  end if;
end;
$$;

create or replace function public.admin_definir_statut_compte_employe(p_user_id uuid, p_actif boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.profils where id = auth.uid() and role = 'administrateur'
  ) then
    raise exception 'Action reservee aux administrateurs.';
  end if;

  update public.profils
  set compte_actif = p_actif
  where id = p_user_id
    and role = 'employe';

  if not found then
    raise exception 'Compte employe introuvable.';
  end if;
end;
$$;

revoke execute on function public.admin_activer_role_employe from public, anon;
revoke execute on function public.admin_definir_statut_compte_employe from public, anon;
grant execute on function public.admin_activer_role_employe to authenticated;
grant execute on function public.admin_definir_statut_compte_employe to authenticated;
