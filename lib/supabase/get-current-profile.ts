import { createClient } from "@/lib/supabase/server";

export type CurrentProfile = {
  id: string;
  prenom: string;
  role: "utilisateur" | "employe" | "administrateur";
  compte_actif: boolean;
} | null;

// Récupère le profil de l'utilisateur connecté (serveur uniquement)
// Inclut rôle et compte_actif pour vérifier si le compte est actif avant d'accéder aux routes protégées
export async function getCurrentProfile(): Promise<CurrentProfile> {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (!userId) return null;

  const { data: profil, error } = await supabase
    .from("profils")
    .select("id, prenom, role, compte_actif")
    .eq("id", userId)
    .single();

  if (error || !profil) return null;

  return profil;
}
