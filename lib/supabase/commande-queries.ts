import { createClient } from "@/lib/supabase/server";

export interface MenuPourCommande {
  id: string;
  titre: string;
  prixBase: number;
  nbPersonnesMin: number;
  stockDisponible: number;
}

export async function getMenuPourCommande(
  menuId: string
): Promise<MenuPourCommande | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("menus")
    .select("id, titre, prix_base, nb_personnes_min, stock_disponible, actif")
    .eq("id", menuId)
    .eq("actif", true)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    titre: data.titre,
    prixBase: Number(data.prix_base),
    nbPersonnesMin: data.nb_personnes_min,
    stockDisponible: data.stock_disponible,
  };
}

export interface ProfilPourCommande {
  nom: string;
  prenom: string;
  email: string;
  telephone: string | null;
}

export async function getProfilPourCommande(
  userId: string
): Promise<ProfilPourCommande | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profils")
    .select("nom, prenom, email, telephone")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data;
}
