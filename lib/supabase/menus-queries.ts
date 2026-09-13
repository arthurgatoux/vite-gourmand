import { createClient } from "@/lib/supabase/client";

export type MenuCatalogue = {
  id: string;
  titre: string;
  description: string | null;
  theme: string | null;
  prix_base: number;
  nb_personnes_min: number;
  conditions: string | null;
  delai_commande_jours: number | null;
  stock_disponible: number | null;
  image_principale: string | null;
  regimes: string[];
};

export type FiltresMenu = {
  prixMax: number | null;
  prixMin: number | null;
  theme: string | null;
  regime: string | null;
  personnesMin: number | null;
};

/**
 * Recupere le catalogue via la vue menus_catalogue (RLS respectee,
 * security_invoker) et applique les filtres cote client. Utilise dans un
 * Client Component pour permettre une actualisation sans rechargement de
 * page, conformement a l'exigence du CDC.
 */
export async function getMenusCatalogue(): Promise<MenuCatalogue[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("menus_catalogue")
    .select(
      "id, titre, description, theme, prix_base, nb_personnes_min, conditions, delai_commande_jours, stock_disponible, image_principale, regimes"
    )
    .order("titre", { ascending: true });

  if (error) {
    console.error("Erreur lors de la recuperation du catalogue de menus:", error.message);
    return [];
  }

  return data ?? [];
}

export function filtrerMenus(menus: MenuCatalogue[], filtres: FiltresMenu): MenuCatalogue[] {
  return menus.filter((menu) => {
    if (filtres.prixMax !== null && menu.prix_base > filtres.prixMax) return false;
    if (filtres.prixMin !== null && menu.prix_base < filtres.prixMin) return false;
    if (filtres.theme && menu.theme !== filtres.theme) return false;
    if (filtres.regime && !menu.regimes.includes(filtres.regime)) return false;
    if (filtres.personnesMin !== null && menu.nb_personnes_min < filtres.personnesMin) return false;
    return true;
  });
}
