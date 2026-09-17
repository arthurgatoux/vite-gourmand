-- Migration 016 : durcissement RLS - table commandes
-- Ticket Backlog E9 : "Mise en place de la Row Level Security Supabase par role"
--
-- Probleme identifie lors de l'audit RLS (pg_policies) :
-- la policy INSERT existante "utilisateur_cree_sa_commande" verifiait uniquement
-- auth.uid() IS NOT NULL, sans controler que utilisateur_id = auth.uid().
-- Consequence : un utilisateur authentifie pouvait inserer une commande en
-- usurpant l'utilisateur_id d'un autre compte (falsification des commandes,
-- pollution des statistiques admin synchronisees vers MongoDB).
--
-- Applique et verifie sur le projet Supabase vite-gourmand (rxgwaemvocsyysakljdk)
-- le 14/09/2026 via le connecteur Supabase (apply_migration).

drop policy if exists "utilisateur_cree_sa_commande" on public.commandes;

create policy "utilisateur_cree_sa_commande"
on public.commandes
for insert
to authenticated
with check (auth.uid() = utilisateur_id);
