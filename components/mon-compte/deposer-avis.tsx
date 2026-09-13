'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { validerAvis, type ChampAvis } from '@/lib/validations/avis'
import { type AvisExistant } from '@/lib/supabase/mon-compte-queries'

interface DeposerAvisProps {
  commandeId: string
  avisExistant: AvisExistant | null
}

const LABEL_STATUT_AVIS: Record<AvisExistant['statutValidation'], string> = {
  en_attente: 'En attente de validation par notre équipe',
  valide: "Publié sur notre page d'accueil",
  refuse: 'Non retenu pour publication',
}

export function DeposerAvis({ commandeId, avisExistant }: DeposerAvisProps) {
  const router = useRouter()
  const [note, setNote] = useState(5)
  const [commentaire, setCommentaire] = useState('')
  const [erreursChamps, setErreursChamps] = useState<Partial<Record<ChampAvis, string>>>({})
  const [erreurGlobale, setErreurGlobale] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  if (avisExistant) {
    return (
      <div className="mt-6 rounded-2xl border border-border bg-background p-8 shadow-card">
        <h2 className="font-heading text-xl">Votre avis</h2>
        <p
          className="mt-2 text-lg text-accent"
          role="img"
          aria-label={`Note donnée : ${avisExistant.note} sur 5`}
        >
          {'★'.repeat(avisExistant.note)}
          {'☆'.repeat(5 - avisExistant.note)}
        </p>
        <p className="mt-2 text-sm">{avisExistant.commentaire}</p>
        <p className="mt-4 text-xs text-muted-foreground">
          Statut : {LABEL_STATUT_AVIS[avisExistant.statutValidation]}
        </p>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErreurGlobale(null)

    const erreurs = validerAvis({ note, commentaire })
    setErreursChamps(erreurs)
    if (Object.keys(erreurs).length > 0) return

    const supabase = createClient()
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Vous devez être connecté pour déposer un avis.')

      const { error } = await supabase.from('avis').insert({
        commande_id: commandeId,
        utilisateur_id: user.id,
        note,
        commentaire: commentaire.trim(),
      })

      if (error) throw error
      router.refresh()
    } catch (error: unknown) {
      setErreurGlobale(
        error instanceof Error ? error.message : "Une erreur est survenue lors de l'envoi de votre avis."
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="mt-6 flex flex-col gap-6 rounded-2xl border border-border bg-background p-8 shadow-card"
    >
      <div>
        <h2 className="font-heading text-xl">Donnez votre avis</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Votre commande est terminée. Dites-nous comment s'est passée votre prestation.
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="note">Note (sur 5)</Label>
        <select
          id="note"
          value={note}
          onChange={e => setNote(Number(e.target.value))}
          className="flex h-9 w-32 rounded-md border border-input bg-background px-3 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          {[5, 4, 3, 2, 1].map(valeur => (
            <option key={valeur} value={valeur}>
              {valeur} / 5
            </option>
          ))}
        </select>
        {erreursChamps.note && <p className="text-sm text-red-500">{erreursChamps.note}</p>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="commentaire">Votre commentaire</Label>
        <textarea
          id="commentaire"
          rows={5}
          required
          aria-invalid={Boolean(erreursChamps.commentaire)}
          value={commentaire}
          onChange={e => setCommentaire(e.target.value)}
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
        />
        {erreursChamps.commentaire && (
          <p className="text-sm text-red-500">{erreursChamps.commentaire}</p>
        )}
      </div>

      {erreurGlobale && (
        <p className="text-sm text-red-500" role="alert">
          {erreurGlobale}
        </p>
      )}

      <Button type="submit" disabled={isLoading} className="w-fit">
        {isLoading ? 'Envoi...' : 'Envoyer mon avis'}
      </Button>
    </form>
  )
}
