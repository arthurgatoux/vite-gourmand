"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { LABEL_STATUT, type StatutCommande } from "@/lib/supabase/statuts-commande"
import { getProchainsStatuts } from "@/lib/supabase/statuts-transitions"
import { changerStatutCommande, annulerCommandeEmploye } from "@/lib/supabase/employe-actions"

interface ChangerStatutSelectProps {
  commandeId: string
  statutActuel: StatutCommande
}

export function ChangerStatutSelect({ commandeId, statutActuel }: ChangerStatutSelectProps) {
  const prochainsStatuts = getProchainsStatuts(statutActuel)
  const [statutChoisi, setStatutChoisi] = useState<StatutCommande | "">("")
  const [motifAnnulation, setMotifAnnulation] = useState("")
  const [modeContactClient, setModeContactClient] = useState<"" | "gsm" | "email">("")
  const [message, setMessage] = useState<{ type: "success" | "error"; texte: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  if (prochainsStatuts.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        Statut final, aucune mise a jour possible.
      </p>
    )
  }

  const estAnnulation = statutChoisi === "annule"
  const annulationIncomplete = estAnnulation && (!motifAnnulation.trim() || !modeContactClient)

  function handleValider() {
    if (!statutChoisi || annulationIncomplete) return

    setMessage(null)
    startTransition(async () => {
      const resultat = estAnnulation
        ? await annulerCommandeEmploye(commandeId, motifAnnulation, modeContactClient)
        : await changerStatutCommande(commandeId, statutChoisi as StatutCommande)

      if (resultat.success) {
        setMessage({ type: "success", texte: "Statut mis a jour." })
        setStatutChoisi("")
        setMotifAnnulation("")
        setModeContactClient("")
      } else {
        setMessage({ type: "error", texte: resultat.error })
      }
    })
  }

  return (
    <div className="flex flex-col gap-3 border-t pt-3 mt-3">
      <div className="flex flex-wrap items-center gap-2">
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
        <Button size="sm" onClick={handleValider} disabled={!statutChoisi || annulationIncomplete || isPending}>
          {isPending ? "Mise a jour..." : "Valider"}
        </Button>
      </div>

      {estAnnulation && (
        <div className="grid gap-3 rounded-lg border-2 border-accent bg-secondary p-4 sm:grid-cols-2">
          <div className="grid gap-1.5 sm:col-span-2">
            <p className="text-xs font-bold text-foreground">
              Le client doit etre contacte avant toute annulation (CDC).
            </p>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor={`mode-contact-${commandeId}`}>Mode de contact</Label>
            <select
              id={`mode-contact-${commandeId}`}
              value={modeContactClient}
              onChange={e => setModeContactClient(e.target.value as "gsm" | "email")}
              className="flex h-9 rounded-md border border-input bg-background px-2 text-sm shadow-sm"
            >
              <option value="">Choisir...</option>
              <option value="gsm">Appel GSM</option>
              <option value="email">Email</option>
            </select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor={`motif-${commandeId}`}>Motif d&apos;annulation</Label>
            <input
              id={`motif-${commandeId}`}
              type="text"
              value={motifAnnulation}
              onChange={e => setMotifAnnulation(e.target.value)}
              placeholder="Ex: client indisponible pour la date"
              className="flex h-9 rounded-md border border-input bg-background px-2 text-sm shadow-sm"
            />
          </div>
        </div>
      )}

      {message && (
        <p className={message.type === "success" ? "text-xs text-green-600" : "text-xs text-destructive"}>
          {message.texte}
        </p>
      )}
    </div>
  )
}
