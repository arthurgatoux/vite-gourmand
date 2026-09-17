"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { validerCommande, calculerApercuPrix, type ChampCommande } from "@/lib/validations/commande";
import type { MenuPourCommande, ProfilPourCommande } from "@/lib/supabase/commande-queries";
import { creerCommande } from "@/lib/supabase/commande-actions";

type CommandeFormProps = {
  menu: MenuPourCommande;
  profil: ProfilPourCommande | null;
};

export function CommandeForm({ menu, profil }: CommandeFormProps) {
  const router = useRouter();
  const [nomClient, setNomClient] = useState(profil?.nom ?? "");
  const [prenomClient, setPrenomClient] = useState(profil?.prenom ?? "");
  const [emailClient, setEmailClient] = useState(profil?.email ?? "");
  const [telephoneClient, setTelephoneClient] = useState(profil?.telephone ?? "");
  const [adressePrestation, setAdressePrestation] = useState("");
  const [dateprestation, setDateprestation] = useState("");
  const [heureLivraison, setHeureLivraison] = useState("");
  const [nbPersonnes, setNbPersonnes] = useState(menu.nbPersonnesMin);
  const [estABordeaux, setEstABordeaux] = useState(true);
  const [distanceKm, setDistanceKm] = useState(0);
  const [erreursChamps, setErreursChamps] = useState<Partial<Record<ChampCommande, string>>>({});
  const [erreurGlobale, setErreurGlobale] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const apercu = useMemo(
    () => calculerApercuPrix(menu.prixBase, nbPersonnes, menu.nbPersonnesMin, estABordeaux, distanceKm),
    [menu.prixBase, menu.nbPersonnesMin, nbPersonnes, estABordeaux, distanceKm],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreurGlobale(null);

    const donnees = {
      adressePrestation,
      dateprestation,
      heureLivraison,
      nbPersonnes,
      estABordeaux,
      distanceKm,
    };
    const erreurs = validerCommande(donnees, menu.nbPersonnesMin);
    setErreursChamps(erreurs);
    if (Object.keys(erreurs).length > 0) {
      return;
    }

    setIsLoading(true);
    try {
      // Deplace vers une Server Action (lib/supabase/commande-actions.ts) : le
      // prix definitif reste recalcule cote serveur par le trigger Postgres
      // calculer_prix_commande, et le delai minimum de commande du menu (CDC
      // page 4) est desormais verifie avant l'insertion.
      const resultat = await creerCommande(menu.id, {
        ...donnees,
        nomClient,
        prenomClient,
        emailClient,
        telephoneClient,
      });
      if (!resultat.success) {
        throw new Error(resultat.error);
      }
      router.push(`/commande/succes?id=${resultat.commandeId}`);
    } catch (error: unknown) {
      setErreurGlobale(
        error instanceof Error ? error.message : "Une erreur est survenue lors de la commande.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-8 rounded-2xl border border-border bg-background p-8 shadow-card"
    >
      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-2 font-heading text-xl">Vos coordonnées</legend>
        <div className="grid gap-2">
          <Label htmlFor="nomClient">Nom</Label>
          <Input id="nomClient" required value={nomClient} onChange={(e) => setNomClient(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="prenomClient">Prénom</Label>
          <Input id="prenomClient" required value={prenomClient} onChange={(e) => setPrenomClient(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="emailClient">Email</Label>
          <Input id="emailClient" type="email" required value={emailClient} onChange={(e) => setEmailClient(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="telephoneClient">GSM</Label>
          <Input id="telephoneClient" type="tel" required value={telephoneClient ?? ""} onChange={(e) => setTelephoneClient(e.target.value)} />
        </div>
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-2 font-heading text-xl">Votre événement</legend>
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
            min={menu.nbPersonnesMin}
            required
            aria-invalid={Boolean(erreursChamps.nbPersonnes)}
            value={nbPersonnes}
            onChange={(e) => setNbPersonnes(Number(e.target.value))}
          />
          <p className="text-xs text-muted-foreground">
            Minimum {menu.nbPersonnesMin} personnes pour ce menu. À partir de {menu.nbPersonnesMin + 5} personnes une réduction de 10% s&apos;applique.
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
        <h2 className="font-heading text-xl">Détail du prix (aperçu)</h2>
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
          Ce montant est un aperçu, le montant définitif est confirmé par email après validation de la commande.
        </p>
      </div>

      {erreurGlobale && (
        <p className="text-sm text-red-500" role="alert">
          {erreurGlobale}
        </p>
      )}

      <Button type="submit" size="lg" disabled={isLoading}>
        {isLoading ? "Validation en cours..." : "Valider ma commande"}
      </Button>
    </form>
  );
}
