import { createClient } from "@/lib/supabase/server";

export type AvisPublic = {
  id: string;
  note: number;
  commentaire: string | null;
  date_creation: string;
  auteur_prenom: string;
  auteur_initiale_nom: string | null;
};

// Récupère les avis validés pour l'accueil (prenom + initiale nom via la vue avis_publics)
export async function getAvisPublics(limit = 6): Promise<AvisPublic[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("avis_publics")
    .select("id, note, commentaire, date_creation, auteur_prenom, auteur_initiale_nom")
    .order("date_creation", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Erreur lors de la recuperation des avis publics:", error.message);
    return [];
  }

  return data ?? [];
}
