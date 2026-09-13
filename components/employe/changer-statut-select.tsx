"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { LABEL_STATUT, type StatutCommande } from "@/lib/supabase/statuts-commande"
import { getProchainsStatuts } from "@/lib/supabase/statuts-transitions"
import { changerStatutCommande } from "@/lib/supabase/employe-actions"

interface ChangerStatutSelectProps {
  commandeId: string
  statutActuel: StatutCommande
}

export function ChangerStatutSelect({ commandeId, statutActuel }: ChangerStatutSelectProps) {
  const prochainsStatuts = getProchainsStatuts(statutActuel)
  const [statutChoisi, setStatutChoisi] = useState<StatutCommande | "">("")
  const [message, setMessage] = useState<{ type: "success" | "error"; texte: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  if (prochainsStatuts.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        Statut final, aucune mise a jour possible.
      </p>
    )
  }

  function handleValider() {
    if (!statutChoisi) return

    const confirmationNecessaire = statutChoisi === "annule"
    if (
      confirmationNecessaire &&
      !window.confirm(
        "Confirmez-vous avoir contacte le client avant d'annuler cette commande ?"
      )
    ) {
      return
    }

    setMessage(null)
    startTransition(async () => {
      const resultat = await changerStatutCommande(commandeId, statutChoisi as StatutCommande)
      if (resultat.success) {
        setMessage({ type: "success", texte: "Statut mis a jour." })
        setStatutChoisi("")
      } else {
        setMessage({ type: "error", texte: resultat.error })
      }
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-2 border-t pt-3 mt-3">
      <label htmlFor={`statut-${commandeId}`} className="text-xs font-medium text-muted-foreground">
        Changer le statut
      </label>
      <select
        id={`statut-${commandeId}`}
        value={statutChoisi}
        onChange={e => setStatutChoisi(e.target.value as StatutCommande)}
        disabled={isPending}
        className="flex h-9 rounded-md border border-input bg-background px-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <option value="">Choisir...</option>
        {prochainsStatuts.map(statut => (
          <option key={statut} value={statut}>
            {LABEL_STATUT[statut]}
          </option>
        ))}
      </select>
      <Button size="sm" onClick={handleValider} disabled={!statutChoisi || isPending}>
        {isPending ? "Mise a jour..." : "Valider"}
      </Button>
      {message && (
        <p className={message.type === "success" ? "text-xs text-green-600" : "text-xs text-destructive"}>
          {message.texte}
        </p>
      )}
    </div>
  )
}
