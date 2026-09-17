-- supabase/sql/003_auth_profils_trigger_rls.sql
-- Vite Gourmand -- Creation automatique du profil a l'inscription + securisation RLS
--
-- Reference CDC :
-- "A la creation du compte, il lui sera confie le role de utilisateur."
-- "il ne doit pas etre possible de creer un compte Administrateur depuis l'application."
--
-- Applique sur Supabase (projet vite-gourmand, eu-west-1) via connecteur MCP le 13/09/2026.

-- 1. Fonction de creation automatique du profil (SECURITY DEFINER -> bypass RLS a l'insertion)
--    Lit les metadonnees envoyees a l'inscription (auth.signUp options.data) :
--    nom, prenom, telephone, adresse_postale. Le role garde sa valeur par defaut
--    'utilisateur' definie sur la colonne profils.role : aucune metadonnee client
--    ne peut la modifier, ce qui empeche la creation d'un compte administrateur
--    ou employe depuis le formulaire public.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profils (id, nom, prenom, email, telephone, adresse_postale)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nom', ''),
    coalesce(new.raw_user_meta_data->>'prenom', ''),
    new.email,
    new.raw_user_meta_data->>'telephone',
    new.raw_user_meta_data->>'adresse_postale'
  );
  return new;
end;
$$;

-- 2. Trigger sur auth.users : execute automatiquement a chaque inscription
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- 3. Policies RLS sur public.profils
--    Avant cette migration, RLS etait active mais aucune policy n'existait :
--    la table etait totalement fermee, meme pour le proprietaire de la ligne.
create policy "utilisateur_lit_son_profil"
  on public.profils for select
  to authenticated
  using (auth.uid() = id);

create policy "employe_admin_lisent_tous_profils"
  on public.profils for select
  to authenticated
  using (
    exists (
      select 1 from public.profils p
      where p.id = auth.uid() and p.role in ('employe', 'administrateur')
    )
  );

create policy "utilisateur_modifie_son_profil"
  on public.profils for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 4. Trigger anti escalade de privileges : un utilisateur authentifie ne peut
--    pas modifier son propre role via une requete PATCH directe sur profils.
create or replace function public.prevent_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role then
    if not exists (
      select 1 from public.profils where id = auth.uid() and role = 'administrateur'
    ) then
      raise exception 'Modification du role non autorisee';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists before_profils_update_role on public.profils;
create trigger before_profils_update_role
  before update on public.profils
  for each row
  execute function public.prevent_role_escalation();

-- 5. Durcissement : ces deux fonctions SECURITY DEFINER ne doivent etre
--    appelables que par leurs triggers, jamais directement via l'API REST
--    Supabase (PostgREST expose par defaut tout le schema public en RPC).
--    Correction appliquee suite a l'alerte "Security Advisor" de Supabase
--    (anon_security_definer_function_executable / authenticated_...).
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.prevent_role_escalation() from public, anon, authenticated;
