"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { creerMenu, modifierMenu, type DonneesMenu } from "@/lib/supabase/menus-employe-actions"
import type { MenuEdition, PlatOption, RegimeOption } from "@/lib/supabase/menus-employe-queries"

interface MenuFormProps {
  menu?: MenuEdition
  plats: PlatOption[]
  regimes: RegimeOption[]
}

const LABEL_TYPE_PLAT: Record<string, string> = {
  entree: "Entrée",
  plat: "Plat",
  dessert: "Dessert",
}

export function MenuForm({ menu, plats, regimes }: MenuFormProps) {
  const router = useRouter()
  const [titre, setTitre] = useState(menu?.titre ?? "")
  const [description, setDescription] = useState(menu?.description ?? "")
  const [theme, setTheme] = useState(menu?.theme ?? "")
  const [prixBase, setPrixBase] = useState(menu?.prixBase ?? 0)
  const [nbPersonnesMin, setNbPersonnesMin] = useState(menu?.nbPersonnesMin ?? 1)
  const [conditions, setConditions] = useState(menu?.conditions ?? "")
  const [delaiCommandeJours, setDelaiCommandeJours] = useState(menu?.delaiCommandeJours ?? 0)
  const [stockDisponible, setStockDisponible] = useState(menu?.stockDisponible ?? 0)
  const [actif, setActif] = useState(menu?.actif ?? true)
  const [images, setImages] = useState<string[]>(menu?.images.length ? menu.images : [""])
  const [platIds, setPlatIds] = useState<string[]>(menu?.platIds ?? [])
  const [regimeIds, setRegimeIds] = useState<string[]>(menu?.regimeIds ?? [])
  const [erreur, setErreur] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function togglePlat(id: string) {
    setPlatIds(prev => (prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]))
  }

  function toggleRegime(id: string) {
    setRegimeIds(prev => (prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErreur(null)

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
    }

    startTransition(async () => {
      const resultat = menu ? await modifierMenu(menu.id, donnees) : await creerMenu(donnees)
      if (resultat.success) {
        router.push("/employe/menus")
      } else {
        setErreur(resultat.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 rounded-2xl border border-border bg-background p-8 shadow-card">
      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-2 font-heading text-xl">Informations générales</legend>
        <div className="grid gap-2 sm:col-span-2">
          <Label htmlFor="titre">Titre</Label>
          <Input id="titre" required value={titre} onChange={e => setTitre(e.target.value)} />
        </div>
        <div className="grid gap-2 sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            rows={4}
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="theme">Thème</Label>
          <Input id="theme" placeholder="noël, pâques, classique..." value={theme} onChange={e => setTheme(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="prixBase">Prix pour le nombre minimum de personnes (€)</Label>
          <Input id="prixBase" type="number" min={0} step="0.01" required value={prixBase} onChange={e => setPrixBase(Number(e.target.value))} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="nbPersonnesMin">Nombre de personnes minimum</Label>
          <Input id="nbPersonnesMin" type="number" min={1} required value={nbPersonnesMin} onChange={e => setNbPersonnesMin(Number(e.target.value))} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="stockDisponible">Stock disponible</Label>
          <Input id="stockDisponible" type="number" min={0} value={stockDisponible} onChange={e => setStockDisponible(Number(e.target.value))} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="delaiCommandeJours">Délai de commande minimum (jours)</Label>
          <Input id="delaiCommandeJours" type="number" min={0} value={delaiCommandeJours} onChange={e => setDelaiCommandeJours(Number(e.target.value))} />
        </div>
        <div className="grid gap-2 sm:col-span-2">
          <Label htmlFor="conditions">Conditions (mises en évidence côté client)</Label>
          <textarea
            id="conditions"
            rows={2}
            value={conditions}
            onChange={e => setConditions(e.target.value)}
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
        <div className="flex items-center gap-2 sm:col-span-2">
          <input id="actif" type="checkbox" checked={actif} onChange={e => setActif(e.target.checked)} className="h-4 w-4" />
          <Label htmlFor="actif">Menu actif (visible dans le catalogue public)</Label>
        </div>
      </fieldset>

      <fieldset className="grid gap-3">
        <legend className="mb-2 font-heading text-xl">Galerie d&apos;images (URL)</legend>
        {images.map((url, index) => (
          <div key={index} className="flex gap-2">
            <Input value={url} placeholder="https://..." onChange={e => setImages(prev => prev.map((v, i) => (i === index ? e.target.value : v)))} />
            <Button type="button" variant="outline" size="sm" onClick={() => setImages(prev => prev.filter((_, i) => i !== index))}>
              Retirer
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => setImages(prev => [...prev, ""])}>
          Ajouter une image
        </Button>
      </fieldset>

      <fieldset className="grid gap-3">
        <legend className="mb-2 font-heading text-xl">Plats du menu</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {plats.map(plat => (
            <label key={plat.id} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={platIds.includes(plat.id)} onChange={() => togglePlat(plat.id)} className="h-4 w-4" />
              {plat.nom} <span className="text-xs text-muted-foreground">({LABEL_TYPE_PLAT[plat.typePlat]})</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="grid gap-3">
        <legend className="mb-2 font-heading text-xl">Régimes compatibles</legend>
        <div className="flex flex-wrap gap-4">
          {regimes.map(regime => (
            <label key={regime.id} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={regimeIds.includes(regime.id)} onChange={() => toggleRegime(regime.id)} className="h-4 w-4" />
              {regime.nom}
            </label>
          ))}
        </div>
      </fieldset>

      {erreur && <p className="text-sm text-destructive" role="alert">{erreur}</p>}

      <Button type="submit" size="lg" disabled={isPending}>
        {isPending ? "Enregistrement..." : menu ? "Enregistrer les modifications" : "Créer le menu"}
      </Button>
    </form>
  )
}
