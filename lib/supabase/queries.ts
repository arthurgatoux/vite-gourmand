import { createClient } from "@/lib/supabase/server";

export type AvisPublic = {
  id: string;
  note: number;
  commentaire: string | null;
  date_creation: string;
  auteur_prenom: string;
  auteur_initiale_nom: string | null;
};

/**
 * Recupere les avis clients valides (RG6) via la vue avis_publics.
 * La vue minimise les donnees exposees de public.profils (RGPD) :
 * seuls le prenom et l'initiale du nom sont accessibles publiquement,
 * jamais l'email, le telephone ou l'adresse postale.
 */
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
