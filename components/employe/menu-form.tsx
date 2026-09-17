"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { creerMenu, modifierMenu, type DonneesMenu } from "@/lib/supabase/menus-employe-actions";
import { uploaderImageMenu, supprimerImageMenu } from "@/lib/supabase/menu-images-actions";
import type { MenuEdition, PlatOption, RegimeOption } from "@/lib/supabase/menus-employe-queries";

interface MenuFormProps {
  menu?: MenuEdition;
  plats: PlatOption[];
  regimes: RegimeOption[];
}

const LABEL_TYPE_PLAT: Record<string, string> = {
  entree: "Entree",
  plat: "Plat",
  dessert: "Dessert",
};

export function MenuForm({ menu, plats, regimes }: MenuFormProps) {
  const router = useRouter();

  const [titre, setTitre] = useState(menu?.titre ?? "");
  const [description, setDescription] = useState(menu?.description ?? "");
  const [theme, setTheme] = useState(menu?.theme ?? "");
  const [prixBase, setPrixBase] = useState(menu?.prixBase ?? 0);
  const [nbPersonnesMin, setNbPersonnesMin] = useState(menu?.nbPersonnesMin ?? 1);
  const [conditions, setConditions] = useState(menu?.conditions ?? "");
  const [delaiCommandeJours, setDelaiCommandeJours] = useState(menu?.delaiCommandeJours ?? 0);
  const [stockDisponible, setStockDisponible] = useState(menu?.stockDisponible ?? 0);
  const [actif, setActif] = useState(menu?.actif ?? true);
  const [images, setImages] = useState<string[]>(menu?.images.length ? menu.images : []);
  const [platIds, setPlatIds] = useState<string[]>(menu?.platIds ?? []);
  const [regimeIds, setRegimeIds] = useState<string[]>(menu?.regimeIds ?? []);
  const [erreur, setErreur] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [uploadEnCours, setUploadEnCours] = useState(false);
  const [erreurUpload, setErreurUpload] = useState<string | null>(null);

  function togglePlat(id: string) {
    setPlatIds((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  }

  function toggleRegime(id: string) {
    setRegimeIds((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]));
  }

  async function gererSelectionFichier(e: React.ChangeEvent<HTMLInputElement>) {
    const fichier = e.target.files?.[0];
    e.target.value = "";
    if (!fichier) return;

    setErreurUpload(null);
    setUploadEnCours(true);
    const formData = new FormData();
    formData.append("fichier", fichier);
    const resultat = await uploaderImageMenu(formData);
    setUploadEnCours(false);

    if (resultat.success) {
      setImages((prev) => [...prev, resultat.url]);
    } else {
      setErreurUpload(resultat.error);
    }
  }

  function retirerImage(index: number) {
    const url = images[index];
    setImages((prev) => prev.filter((_, i) => i !== index));
    // Nettoyage best-effort du bucket : ne bloque jamais l'edition du formulaire.
    void supprimerImageMenu(url);
  }

  function monterImage(index: number) {
    if (index === 0) return;
    setImages((prev) => {
      const copie = [...prev];
      [copie[index - 1], copie[index]] = [copie[index], copie[index - 1]];
      return copie;
    });
  }

  function descendreImage(index: number) {
    setImages((prev) => {
      if (index >= prev.length - 1) return prev;
      const copie = [...prev];
      [copie[index], copie[index + 1]] = [copie[index + 1], copie[index]];
      return copie;
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);

    const donnees: DonneesMenu = {
      titre,
      description,
      theme,
      prixBase: Number(prixBase),
      nbPersonnesMin: Number(nbPersonnesMin),
      conditions,
      delaiCommandeJours: Number(delaiCommandeJours),
      stockDisponible: Number(stockDisponible),
      actif,
      images,
      platIds,
      regimeIds,
    };

    startTransition(async () => {
      const resultat = menu ? await modifierMenu(menu.id, donnees) : await creerMenu(donnees);
      if (resultat.success) {
        router.push("/employe/menus");
      } else {
        setErreur(resultat.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 rounded-2xl border border-border bg-background p-8 shadow-card">
      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-2 font-heading text-xl">Informations generales</legend>
        <div className="grid gap-2 sm:col-span-2">
          <Label htmlFor="titre">Titre</Label>
          <Input id="titre" required value={titre} onChange={(e) => setTitre(e.target.value)} />
        </div>
        <div className="grid gap-2 sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="theme">Theme</Label>
          <Input id="theme" placeholder="noel, paques, classique..." value={theme} onChange={(e) => setTheme(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="prixBase">Prix par personne</Label>
          <Input id="prixBase" type="number" min={0} step={0.01} required value={prixBase} onChange={(e) => setPrixBase(Number(e.target.value))} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="nbPersonnesMin">Nombre de personnes minimum</Label>
          <Input id="nbPersonnesMin" type="number" min={1} required value={nbPersonnesMin} onChange={(e) => setNbPersonnesMin(Number(e.target.value))} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="stockDisponible">Stock disponible</Label>
          <Input id="stockDisponible" type="number" min={0} value={stockDisponible} onChange={(e) => setStockDisponible(Number(e.target.value))} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="delaiCommandeJours">Delai de commande minimum (jours)</Label>
          <Input id="delaiCommandeJours" type="number" min={0} value={delaiCommandeJours} onChange={(e) => setDelaiCommandeJours(Number(e.target.value))} />
        </div>
        <div className="grid gap-2 sm:col-span-2">
          <Label htmlFor="conditions">Conditions mises en evidence cote client</Label>
          <textarea
            id="conditions"
            rows={2}
            value={conditions}
            onChange={(e) => setConditions(e.target.value)}
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
        <div className="flex items-center gap-2 sm:col-span-2">
          <input id="actif" type="checkbox" checked={actif} onChange={(e) => setActif(e.target.checked)} className="h-4 w-4" />
          <Label htmlFor="actif">Menu actif (visible dans le catalogue public)</Label>
        </div>
      </fieldset>

      <fieldset className="grid gap-3">
        <legend className="mb-2 font-heading text-xl">Galerie d&apos;images</legend>
        <p className="text-sm text-muted-foreground">
          La premiere image de la liste est utilisee comme photo principale du menu. Formats acceptes : JPEG, PNG, WebP (3 Mo maximum par image).
        </p>

        <div className="grid gap-2">
          <Label htmlFor="fichier-image">Ajouter une image</Label>
          <input
            id="fichier-image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={gererSelectionFichier}
            disabled={uploadEnCours}
            className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary-foreground disabled:opacity-50"
          />
          {uploadEnCours && (
            <p className="text-sm text-muted-foreground" role="status">
              Envoi en cours...
            </p>
          )}
          {erreurUpload && (
            <p className="text-sm text-destructive" role="alert">
              {erreurUpload}
            </p>
          )}
        </div>

        {images.length > 0 && (
          <ol className="grid gap-3 sm:grid-cols-2">
            {images.map((url, index) => (
              <li key={url} className="flex flex-col gap-2 rounded-xl border border-border p-3">
                <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-secondary">
                  {/* Apercu de gestion (espace employe), pas une image de contenu public. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`Apercu de l'image ${index + 1} du menu`} className="h-full w-full object-cover" />
                  {index === 0 && (
                    <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">
                      Image principale
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={index === 0}
                      onClick={() => monterImage(index)}
                      aria-label={`Monter l'image ${index + 1} dans l'ordre d'affichage`}
                    >
                      Monter
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={index === images.length - 1}
                      onClick={() => descendreImage(index)}
                      aria-label={`Descendre l'image ${index + 1} dans l'ordre d'affichage`}
                    >
                      Descendre
                    </Button>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => retirerImage(index)}>
                    Retirer
                  </Button>
                </div>
              </li>
            ))}
          </ol>
        )}
      </fieldset>

      <fieldset className="grid gap-3">
        <legend className="mb-2 font-heading text-xl">Plats du menu</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {plats.map((plat) => (
            <label key={plat.id} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={platIds.includes(plat.id)} onChange={() => togglePlat(plat.id)} className="h-4 w-4" />
              {plat.nom} <span className="text-xs text-muted-foreground">{LABEL_TYPE_PLAT[plat.typePlat]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="grid gap-3">
        <legend className="mb-2 font-heading text-xl">Regimes compatibles</legend>
        <div className="flex flex-wrap gap-4">
          {regimes.map((regime) => (
            <label key={regime.id} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={regimeIds.includes(regime.id)} onChange={() => toggleRegime(regime.id)} className="h-4 w-4" />
              {regime.nom}
            </label>
          ))}
        </div>
      </fieldset>

      {erreur && (
        <p className="text-sm text-destructive" role="alert">
          {erreur}
        </p>
      )}

      <Button type="submit" size="lg" disabled={isPending}>
        {isPending ? "Enregistrement..." : menu ? "Enregistrer les modifications" : "Creer le menu"}
      </Button>
    </form>
  );
}
