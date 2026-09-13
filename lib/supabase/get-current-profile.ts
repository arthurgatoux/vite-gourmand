import { createClient } from "@/lib/supabase/server";

export type CurrentProfile = {
  id: string;
  prenom: string;
  role: "utilisateur" | "employe" | "administrateur";
} | null;

/**
 * Recupere le profil applicatif (role inclus) de l'utilisateur connecte.
 * Retourne null si personne n'est authentifie. Utilise cote serveur
 * uniquement (Server Component / layout), jamais expose au client tel quel.
 */
export async function getCurrentProfile(): Promise<CurrentProfile> {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;

  if (!userId) {
    return null;
  }

  const { data: profil, error } = await supabase
    .from("profils")
    .select("id, prenom, role")
    .eq("id", userId)
    .single();

  if (error || !profil) {
    return null;
  }

  return profil;
}
