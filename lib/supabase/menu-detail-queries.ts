import { createClient } from "@/lib/supabase/server";

export type PlatDetail = {
  nom: string;
  description: string | null;
  type_plat: "entree" | "plat" | "dessert";
  allergenes: string[];
};

export type MenuDetail = {
  id: string;
  titre: string;
  description: string | null;
  theme: string | null;
  prix_base: number;
  nb_personnes_min: number;
  conditions: string | null;
  delai_commande_jours: number | null;
  stock_disponible: number | null;
  images: string[];
  regimes: string[];
  plats: PlatDetail[];
};

const ORDRE_PLAT: Record<string, number> = { entree: 0, plat: 1, dessert: 2 };

export async function getMenuDetail(id: string): Promise<MenuDetail | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("menus")
    .select(
      `
      id, titre, description, theme, prix_base, nb_personnes_min, conditions, delai_commande_jours, stock_disponible,
      menu_images ( url, ordre ),
      menu_regime ( regimes ( nom ) ),
      menu_plat ( plats ( nom, description, type_plat, plat_allergene ( allergenes ( nom ) ) ) )
      `
    )
    .eq("id", id)
    .eq("actif", true)
    .single();

  if (error || !data) {
    return null;
  }

  const images = (data.menu_images ?? [])
    .sort((a: { ordre: number }, b: { ordre: number }) => a.ordre - b.ordre)
    .map((img: { url: string }) => img.url);

  const regimes = (data.menu_regime ?? []).map(
    (mr: { regimes: { nom: string } | null }) => mr.regimes?.nom
  ).filter((n: string | undefined): n is string => Boolean(n));

  const plats: PlatDetail[] = (data.menu_plat ?? [])
    .map((mp: { plats: { nom: string; description: string | null; type_plat: PlatDetail["type_plat"]; plat_allergene: { allergenes: { nom: string } | null }[] } | null }) => {
      const plat = mp.plats;
      if (!plat) return null;
      return {
        nom: plat.nom,
        description: plat.description,
        type_plat: plat.type_plat,
        allergenes: (plat.plat_allergene ?? [])
          .map((pa) => pa.allergenes?.nom)
          .filter((n): n is string => Boolean(n)),
      };
    })
    .filter((p: PlatDetail | null): p is PlatDetail => p !== null)
    .sort((a: PlatDetail, b: PlatDetail) => ORDRE_PLAT[a.type_plat] - ORDRE_PLAT[b.type_plat]);

  return {
    id: data.id,
    titre: data.titre,
    description: data.description,
    theme: data.theme,
    prix_base: data.prix_base,
    nb_personnes_min: data.nb_personnes_min,
    conditions: data.conditions,
    delai_commande_jours: data.delai_commande_jours,
    stock_disponible: data.stock_disponible,
    images,
    regimes,
    plats,
  };
}
