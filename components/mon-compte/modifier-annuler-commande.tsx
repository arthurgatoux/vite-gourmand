"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  validerCommande,
  calculerApercuPrix,
  type ChampCommande,
  type DonneesCommande,
} from "@/lib/validations/commande";
import type { CommandeDetail } from "@/lib/supabase/mon-compte-queries";
import { modifierCommandeUtilisateur, annulerCommandeUtilisateur } from "@/lib/supabase/commande-actions";

interface ModifierAnnulerCommandeProps {
  commande: CommandeDetail;
}

export function ModifierAnnulerCommande({ commande }: ModifierAnnulerCommandeProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"lecture" | "modification">("lecture");
  const [adressePrestation, setAdressePrestation] = useState(commande.adressePrestation);
  const [dateprestation, setDateprestation] = useState(commande.datePrestation);
  const [heureLivraison, setHeureLivraison] = useState(commande.heureLivraison);
  const [nbPersonnes, setNbPersonnes] = useState(commande.nbPersonnes);
  const [estABordeaux, setEstABordeaux] = useState(!commande.distanceKm);
  const [distanceKm, setDistanceKm] = useState(commande.distanceKm ?? 0);
  const [erreursChamps, setErreursChamps] = useState<Partial<Record<ChampCommande, string>>>({});
  const [erreurGlobale, setErreurGlobale] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const apercu = useMemo(
    () =>
      calculerApercuPrix(
        commande.prixBaseMenu,
        nbPersonnes,
        commande.nbPersonnesMinMenu,
        estABordeaux,
        distanceKm,
      ),
    [commande.prixBaseMenu, commande.nbPersonnesMinMenu, nbPersonnes, estABordeaux, distanceKm],
  );

  if (commande.statutCourant !== "en_attente") {
    return null;
  }

  async function handleModifier(e: React.FormEvent) {
    e.preventDefault();
    setErreurGlobale(null);

    const donnees: DonneesCommande = {
      adressePrestation,
      dateprestation,
      heureLivraison,
      nbPersonnes,
      estABordeaux,
      distanceKm,
    };
    const erreurs = validerCommande(donnees, commande.nbPersonnesMinMenu);
    setErreursChamps(erreurs);
    if (Object.keys(erreurs).length > 0) {
      return;
    }

    setIsLoading(true);
    // Modification de la commande via Server Action (recalcul auto du montant côté DB)
    const resultat = await modifierCommandeUtilisateur(commande.id, donnees);
    if (resultat.success) {
      setMode("lecture");
      router.refresh();
    } else {
      setErreurGlobale(resultat.error);
    }
    setIsLoading(false);
  }

  async function handleAnnuler() {
    const confirme = window.confirm(
      "Confirmez-vous l'annulation de cette commande ? Cette action est irréversible.",
    );
    if (!confirme) return;

    setIsLoading(true);
    setErreurGlobale(null);
    const resultat = await annulerCommandeUtilisateur(commande.id);
    if (resultat.success) {
      router.refresh();
    } else {
      setErreurGlobale(resultat.error);
    }
    setIsLoading(false);
  }

  if (mode === "lecture") {
    return (
      <div className="mt-6 flex flex-wrap items-start gap-3">
        <Button variant="outline" onClick={() => setMode("modification")} disabled={isLoading}>
          Modifier ma commande
        </Button>
        <Button variant="destructive" onClick={handleAnnuler} disabled={isLoading}>
          Annuler ma commande
        </Button>
        {erreurGlobale && (
          <p className="w-full text-sm text-red-500" role="alert">
            {erreurGlobale}
          </p>
        )}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleModifier}
      noValidate
      className="mt-6 flex flex-col gap-8 rounded-2xl border border-border bg-background p-8 shadow-card"
    >
      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-2 font-heading text-xl">Modifier ma commande</legend>
        <div className="grid gap-2 sm:col-span-2">
          <Label htmlFor="adressePrestation">Adresse de la prestation</Label>
          <Input
            id="adressePrestation"
            required
            aria-invalid={Boolean(erreursChamps.adressePrestation)}
            value={adressePrestation}
            onChange={(e) => setAdressePrestation(e.target.value)}
          />
          {erreursChamps.adressePrestation && (
            <p className="text-sm text-red-500">{erreursChamps.adressePrestation}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="dateprestation">Date de la prestation</Label>
          <Input
            id="dateprestation"
            type="date"
            required
            aria-invalid={Boolean(erreursChamps.dateprestation)}
            value={dateprestation}
            onChange={(e) => setDateprestation(e.target.value)}
          />
          {erreursChamps.dateprestation && (
            <p className="text-sm text-red-500">{erreursChamps.dateprestation}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="heureLivraison">Heure de livraison souhaitée</Label>
          <Input
            id="heureLivraison"
            type="time"
            required
            aria-invalid={Boolean(erreursChamps.heureLivraison)}
            value={heureLivraison}
            onChange={(e) => setHeureLivraison(e.target.value)}
          />
          {erreursChamps.heureLivraison && (
            <p className="text-sm text-red-500">{erreursChamps.heureLivraison}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="nbPersonnes">Nombre de personnes</Label>
          <Input
            id="nbPersonnes"
            type="number"
            min={commande.nbPersonnesMinMenu}
            required
            aria-invalid={Boolean(erreursChamps.nbPersonnes)}
            value={nbPersonnes}
            onChange={(e) => setNbPersonnes(Number(e.target.value))}
          />
          <p className="text-xs text-muted-foreground">
            Minimum {commande.nbPersonnesMinMenu} personnes pour ce menu.
          </p>
          {erreursChamps.nbPersonnes && (
            <p className="text-sm text-red-500">{erreursChamps.nbPersonnes}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="estABordeaux">Lieu de livraison</Label>
          <select
            id="estABordeaux"
            value={estABordeaux ? "bordeaux" : "hors-bordeaux"}
            onChange={(e) => setEstABordeaux(e.target.value === "bordeaux")}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="bordeaux">À Bordeaux (5,00 EUR de livraison)</option>
            <option value="hors-bordeaux">Hors Bordeaux (5,00 EUR + 0,59 EUR/km)</option>
          </select>
          {!estABordeaux && (
            <div className="mt-2 grid gap-2">
              <Label htmlFor="distanceKm">Distance depuis Bordeaux (km)</Label>
              <Input
                id="distanceKm"
                type="number"
                min={1}
                aria-invalid={Boolean(erreursChamps.distanceKm)}
                value={distanceKm}
                onChange={(e) => setDistanceKm(Number(e.target.value))}
              />
              {erreursChamps.distanceKm && (
                <p className="text-sm text-red-500">{erreursChamps.distanceKm}</p>
              )}
            </div>
          )}
        </div>
      </fieldset>

      <div className="rounded-xl border-2 border-accent bg-secondary p-6" aria-live="polite">
        <h2 className="font-heading text-xl">Nouveau prix (aperçu)</h2>
        <dl className="mt-4 flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <dt>
              Menu ({nbPersonnes} pers.){apercu.reductionPourcentage > 0 ? ` (-${apercu.reductionPourcentage}% réduction)` : ""}
            </dt>
            <dd className="font-bold">{apercu.prixMenu.toFixed(2)} EUR</dd>
          </div>
          <div className="flex justify-between">
            <dt>Livraison</dt>
            <dd className="font-bold">{apercu.prixLivraison.toFixed(2)} EUR</dd>
          </div>
          <div className="mt-2 flex justify-between border-t border-border pt-2 text-lg">
            <dt className="font-bold">Total</dt>
            <dd className="font-heading text-primary">{apercu.prixTotal.toFixed(2)} EUR</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-muted-foreground">
          Ce montant est un aperçu, le montant définitif est confirmé par email après validation de la modification.
        </p>
      </div>

      {erreurGlobale && (
        <p className="text-sm text-red-500" role="alert">
          {erreurGlobale}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" size="lg" disabled={isLoading}>
          {isLoading ? "Enregistrement..." : "Enregistrer les modifications"}
        </Button>
        <Button type="button" variant="outline" size="lg" onClick={() => setMode("lecture")} disabled={isLoading}>
          Annuler la modification
        </Button>
      </div>
    </form>
  );
}
