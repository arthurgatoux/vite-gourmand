-- Correctif de la recursion infinie RLS sur public.profils.
-- Les policies qui interrogent profils doivent utiliser cette fonction
-- SECURITY DEFINER au lieu d'une sous-requete directe sur profils.

create or replace function public.est_employe_ou_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profils
    where id = auth.uid() and role in ('employe', 'administrateur')
  );
$$;

grant execute on function public.est_employe_ou_admin() to authenticated;
revoke execute on function public.est_employe_ou_admin() from public, anon;

drop policy if exists "employe_admin_lisent_tous_profils" on public.profils;
create policy "employe_admin_lisent_tous_profils"
  on public.profils for select
  to authenticated
  using (public.est_employe_ou_admin());

drop policy if exists "utilisateur_lit_ses_commandes" on public.commandes;
create policy "utilisateur_lit_ses_commandes"
  on public.commandes for select
  to authenticated
  using (utilisateur_id = auth.uid() or public.est_employe_ou_admin());

drop policy if exists "employe_admin_modifient_toutes_commandes" on public.commandes;
create policy "employe_admin_modifient_toutes_commandes"
  on public.commandes for update
  to authenticated
  using (public.est_employe_ou_admin());

drop policy if exists "lecture_historique_commande_concernee" on public.historique_statut_commande;
create policy "lecture_historique_commande_concernee"
  on public.historique_statut_commande for select
  to authenticated
  using (
    exists (
      select 1 from public.commandes c
      where c.id = historique_statut_commande.commande_id
        and (c.utilisateur_id = auth.uid() or public.est_employe_ou_admin())
    )
  );

drop policy if exists "employe_admin_lisent_messages_contact" on public.messages_contact;
create policy "employe_admin_lisent_messages_contact"
  on public.messages_contact for select
  to authenticated
  using (public.est_employe_ou_admin());

drop policy if exists "employe_admin_modifient_messages_contact" on public.messages_contact;
create policy "employe_admin_modifient_messages_contact"
  on public.messages_contact for update
  to authenticated
  using (public.est_employe_ou_admin())
  with check (public.est_employe_ou_admin());
