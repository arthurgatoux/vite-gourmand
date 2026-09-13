'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { validerModificationProfil, type ChampProfil } from '@/lib/validations/profil'
import { type ProfilComplet } from '@/lib/supabase/profil-queries'

interface ModifierProfilFormProps {
  profil: ProfilComplet
}

export function ModifierProfilForm({ profil }: ModifierProfilFormProps) {
  const router = useRouter()
  const [nom, setNom] = useState(profil.nom)
  const [prenom, setPrenom] = useState(profil.prenom)
  const [telephone, setTelephone] = useState(profil.telephone ?? '')
  const [adressePostale, setAdressePostale] = useState(profil.adressePostale ?? '')
  const [erreursChamps, setErreursChamps] = useState<Partial<Record<ChampProfil, string>>>({})
  const [erreurGlobale, setErreurGlobale] = useState<string | null>(null)
  const [succes, setSucces] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErreurGlobale(null)
    setSucces(false)

    const erreurs = validerModificationProfil({ nom, prenom, telephone, adressePostale })
    setErreursChamps(erreurs)
    if (Object.keys(erreurs).length > 0) return

    const supabase = createClient()
    setIsLoading(true)
    try {
      // L'email (identifiant Supabase Auth) n'est pas modifiable depuis ce formulaire :
      // il n'est pas synchronise automatiquement avec auth.users et casserait la connexion.
      const { error } = await supabase
        .from('profils')
        .update({
          nom: nom.trim(),
          prenom: prenom.trim(),
          telephone: telephone.trim(),
          adresse_postale: adressePostale.trim(),
        })
        .eq('id', profil.id)

      if (error) throw error
      setSucces(true)
      router.refresh()
    } catch (error: unknown) {
      setErreurGlobale(
        error instanceof Error ? error.message : 'Une erreur est survenue lors de la mise a jour.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-6 rounded-2xl border border-border bg-background p-8 shadow-card"
    >
      <div className="grid gap-2">
        <Label htmlFor="email">Email (identifiant de connexion)</Label>
        <Input id="email" type="email" value={profil.email} disabled readOnly />
        <p className="text-xs text-muted-foreground">
          L'email de connexion ne peut pas être modifié depuis cet espace. Contactez-nous si besoin.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="nom">Nom</Label>
          <Input
            id="nom"
            required
            aria-invalid={Boolean(erreursChamps.nom)}
            value={nom}
            onChange={e => setNom(e.target.value)}
          />
          {erreursChamps.nom && <p className="text-sm text-red-500">{erreursChamps.nom}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="prenom">Prénom</Label>
          <Input
            id="prenom"
            required
            aria-invalid={Boolean(erreursChamps.prenom)}
            value={prenom}
            onChange={e => setPrenom(e.target.value)}
          />
          {erreursChamps.prenom && <p className="text-sm text-red-500">{erreursChamps.prenom}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="telephone">Téléphone</Label>
          <Input
            id="telephone"
            type="tel"
            required
            aria-invalid={Boolean(erreursChamps.telephone)}
            value={telephone}
            onChange={e => setTelephone(e.target.value)}
          />
          {erreursChamps.telephone && (
            <p className="text-sm text-red-500">{erreursChamps.telephone}</p>
          )}
        </div>
        <div className="grid gap-2 sm:col-span-2">
          <Label htmlFor="adressePostale">Adresse postale</Label>
          <Input
            id="adressePostale"
            required
            aria-invalid={Boolean(erreursChamps.adressePostale)}
            value={adressePostale}
            onChange={e => setAdressePostale(e.target.value)}
          />
          {erreursChamps.adressePostale && (
            <p className="text-sm text-red-500">{erreursChamps.adressePostale}</p>
          )}
        </div>
      </div>

      {succes && (
        <p className="text-sm text-green-600" role="status">
          Vos informations ont bien été mises à jour.
        </p>
      )}
      {erreurGlobale && (
        <p className="text-sm text-red-500" role="alert">
          {erreurGlobale}
        </p>
      )}

      <Button type="submit" disabled={isLoading} className="w-fit">
        {isLoading ? 'Enregistrement...' : 'Enregistrer mes informations'}
      </Button>
    </form>
  )
}
