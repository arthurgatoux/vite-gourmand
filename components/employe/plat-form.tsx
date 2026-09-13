"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { creerPlat, modifierPlat, type DonneesPlat } from "@/lib/supabase/plats-employe-actions"
import type { AllergeneOption, PlatEdition } from "@/lib/supabase/plats-employe-queries"

interface PlatFormProps {
  plat?: PlatEdition
  allergenes: AllergeneOption[]
}

export function PlatForm({ plat, allergenes }: PlatFormProps) {
  const router = useRouter()
  const [nom, setNom] = useState(plat?.nom ?? "")
  const [description, setDescription] = useState(plat?.description ?? "")
  const [typePlat, setTypePlat] = useState<DonneesPlat["typePlat"]>(plat?.typePlat ?? "plat")
  const [allergeneIds, setAllergeneIds] = useState<string[]>(plat?.allergeneIds ?? [])
  const [erreur, setErreur] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function toggleAllergene(id: string) {
    setAllergeneIds(prev => (prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErreur(null)

    const donnees: DonneesPlat = { nom, description, typePlat, allergeneIds }

    startTransition(async () => {
      const resultat = plat ? await modifierPlat(plat.id, donnees) : await creerPlat(donnees)
      if (resultat.success) {
        router.push("/employe/plats")
      } else {
        setErreur(resultat.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 rounded-2xl border border-border bg-background p-8 shadow-card">
      <div className="grid gap-2">
        <Label htmlFor="nom">Nom du plat</Label>
        <Input id="nom" required value={nom} onChange={e => setNom(e.target.value)} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          rows={3}
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="typePlat">Type</Label>
        <select
          id="typePlat"
          value={typePlat}
          onChange={e => setTypePlat(e.target.value as DonneesPlat["typePlat"])}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="entree">Entrée</option>
          <option value="plat">Plat</option>
          <option value="dessert">Dessert</option>
        </select>
      </div>
      <fieldset className="grid gap-3">
        <legend className="mb-1 text-sm font-bold uppercase tracking-wide text-muted-foreground">Allergènes</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {allergenes.map(allergene => (
            <label key={allergene.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={allergeneIds.includes(allergene.id)}
                onChange={() => toggleAllergene(allergene.id)}
                className="h-4 w-4"
              />
              {allergene.nom}
            </label>
          ))}
        </div>
      </fieldset>

      {erreur && <p className="text-sm text-destructive" role="alert">{erreur}</p>}

      <Button type="submit" size="lg" disabled={isPending}>
        {isPending ? "Enregistrement..." : plat ? "Enregistrer les modifications" : "Créer le plat"}
      </Button>
    </form>
  )
}
