"use client";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { FiltresMenu } from "@/lib/supabase/menus-queries";

type MenusFiltresProps = {
  filtres: FiltresMenu;
  themes: string[];
  regimes: string[];
  onChange: (filtres: FiltresMenu) => void;
  onReset: () => void;
};

export function MenusFiltres({ filtres, themes, regimes, onChange, onReset }: MenusFiltresProps) {
  return (
    <fieldset className="grid gap-6 rounded-2xl border border-border bg-background p-6 shadow-card sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
      <legend className="sr-only">Filtrer les menus</legend>

      <div className="flex flex-col gap-2">
        <Label htmlFor="filtre-prix-max">Prix maximum</Label>
        <input
          id="filtre-prix-max"
          type="number"
          min={0}
          placeholder="80"
          value={filtres.prixMax ?? ""}
          onChange={(e) =>
            onChange({ ...filtres, prixMax: e.target.value ? Number(e.target.value) : null })
          }
          className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 text-base shadow-sm focus-visible:outline-none focus-visible:ring focus-visible:ring-ring"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="filtre-prix-min">Prix minimum</Label>
        <input
          id="filtre-prix-min"
          type="number"
          min={0}
          placeholder="25"
          value={filtres.prixMin ?? ""}
          onChange={(e) =>
            onChange({ ...filtres, prixMin: e.target.value ? Number(e.target.value) : null })
          }
          className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 text-base shadow-sm focus-visible:outline-none focus-visible:ring focus-visible:ring-ring"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="filtre-theme">Thème</Label>
        <select
          id="filtre-theme"
          value={filtres.theme ?? ""}
          onChange={(e) => onChange({ ...filtres, theme: e.target.value || null })}
          className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-base shadow-sm focus-visible:outline-none focus-visible:ring focus-visible:ring-ring"
        >
          <option value="">Tous les thèmes</option>
          {themes.map((theme) => (
            <option key={theme} value={theme}>
              {theme}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="filtre-regime">Régime</Label>
        <select
          id="filtre-regime"
          value={filtres.regime ?? ""}
          onChange={(e) => onChange({ ...filtres, regime: e.target.value || null })}
          className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-base shadow-sm focus-visible:outline-none focus-visible:ring focus-visible:ring-ring"
        >
          <option value="">Tous les régimes</option>
          {regimes.map((regime) => (
            <option key={regime} value={regime}>
              {regime}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="filtre-personnes">Personnes minimum</Label>
        <input
          id="filtre-personnes"
          type="number"
          min={0}
          placeholder="10"
          value={filtres.personnesMin ?? ""}
          onChange={(e) =>
            onChange({ ...filtres, personnesMin: e.target.value ? Number(e.target.value) : null })
          }
          className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 text-base shadow-sm focus-visible:outline-none focus-visible:ring focus-visible:ring-ring"
        />
      </div>

      <div className="sm:col-span-2 lg:col-span-5">
        <Button type="button" variant="outline" onClick={onReset}>
          Réinitialiser les filtres
        </Button>
      </div>
    </fieldset>
  );
}
