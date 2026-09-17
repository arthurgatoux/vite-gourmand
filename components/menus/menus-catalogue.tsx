"use client";

import { useEffect, useMemo, useState } from "react";
import { MenuCard } from "@/components/menus/menu-card";
import { MenusFiltres } from "@/components/menus/menus-filtres";
import {
  filtrerMenus,
  getMenusCatalogue,
  type FiltresMenu,
  type MenuCatalogue,
} from "@/lib/supabase/menus-queries";

const FILTRES_INITIAUX: FiltresMenu = {
  prixMax: null,
  prixMin: null,
  theme: null,
  regime: null,
  personnesMin: null,
};

export function MenusCatalogueClient() {
  const [menus, setMenus] = useState<MenuCatalogue[]>([]);
  const [chargement, setChargement] = useState(true);
  const [filtres, setFiltres] = useState<FiltresMenu>(FILTRES_INITIAUX);

  useEffect(() => {
    let annule = false;
    getMenusCatalogue().then((data) => {
      if (!annule) {
        setMenus(data);
        setChargement(false);
      }
    });
    return () => {
      annule = true;
    };
  }, []);

  const themes = useMemo(
    () => Array.from(new Set(menus.map((m) => m.theme).filter((t): t is string => Boolean(t)))),
    [menus]
  );
  const regimes = useMemo(
    () => Array.from(new Set(menus.flatMap((m) => m.regimes))),
    [menus]
  );

  const menusFiltres = useMemo(() => filtrerMenus(menus, filtres), [menus, filtres]);

  return (
    <div className="flex flex-col gap-8">
      <MenusFiltres
        filtres={filtres}
        themes={themes}
        regimes={regimes}
        onChange={setFiltres}
        onReset={() => setFiltres(FILTRES_INITIAUX)}
      />

      <div aria-live="polite" className="text-sm text-muted-foreground">
        {chargement
          ? "Chargement des menus..."
          : `${menusFiltres.length} menu${menusFiltres.length > 1 ? "s" : ""} correspond${menusFiltres.length > 1 ? "ent" : ""} à vos critères`}
      </div>

      {!chargement && menusFiltres.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
          Aucun menu ne correspond à ces critères. Essayez d&apos;élargir votre recherche.
        </p>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {menusFiltres.map((menu) => (
            <MenuCard key={menu.id} menu={menu} />
          ))}
        </ul>
      )}
    </div>
  );
}
