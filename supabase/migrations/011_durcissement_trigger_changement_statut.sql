-- Correctif de securite (Security Advisor Supabase) : la fonction trigger
-- apres_changement_statut_commande etait executable directement en RPC par
-- anon et authenticated, contrairement aux autres fonctions trigger-only du
-- projet (handle_new_user, prevent_role_escalation, envoyer_email_bienvenue)
-- qui ont deja ce revoke depuis les migrations precedentes.

revoke execute on function public.apres_changement_statut_commande from public, anon, authenticated;
