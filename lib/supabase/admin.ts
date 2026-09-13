import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Client Supabase avec la cle service_role. Server-only : ne jamais importer
 * ce fichier depuis un composant client, et ne jamais exposer la variable
 * SUPABASE_SERVICE_ROLE_KEY au bundle navigateur.
 *
 * Utilise uniquement pour l'API Auth Admin (creation de compte employe par
 * l'administrateur, CDC page 9). Toutes les autres mutations passent par
 * le client authentifie classique + RLS/RPC (admin.ts ne touche jamais aux
 * tables metier directement).
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  return createSupabaseClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
