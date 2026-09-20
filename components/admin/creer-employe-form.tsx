"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { creerCompteEmploye } from "@/lib/supabase/admin-actions";
import { validerCreationEmploye, type ChampCreationEmploye } from "@/lib/validations/admin";

export function CreerEmployeForm() {
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreursChamps, setErreursChamps] = useState<Partial<Record<ChampCreationEmploye, string>>>({});
  const [erreurGlobale, setErreurGlobale] = useState<string | null>(null);
  const [succes, setSucces] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErreurGlobale(null);
    setSucces(false);

    const erreurs = validerCreationEmploye(email, motDePasse);
    setErreursChamps(erreurs);
    if (Object.keys(erreurs).length > 0) return;

    startTransition(async () => {
      const resultat = await creerCompteEmploye(email.trim(), motDePasse);
      if (resultat.success) {
        setSucces(true);
        setEmail("");
        setMotDePasse("");
      } else {
        setErreurGlobale(resultat.error);
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-4 rounded-2xl border border-border bg-background p-6 shadow-card"
    >
      <div className="grid gap-2">
        <Label htmlFor="email-employe">Email du futur employé</Label>
        <Input
          id="email-employe"
          type="email"
          required
          aria-invalid={Boolean(erreursChamps.email)}
          aria-describedby={erreursChamps.email ? "email-employe-erreur" : undefined}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {erreursChamps.email && (
          <p id="email-employe-erreur" className="text-sm text-red-500">
            {erreursChamps.email}
          </p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="mdp-employe">Mot de passe</Label>
        <Input
          id="mdp-employe"
          type="password"
          required
          aria-invalid={Boolean(erreursChamps.motDePasse)}
          aria-describedby={erreursChamps.motDePasse ? "mdp-employe-erreur" : undefined}
          value={motDePasse}
          onChange={(e) => setMotDePasse(e.target.value)}
        />
        {erreursChamps.motDePasse && (
          <p id="mdp-employe-erreur" className="text-sm text-red-500">
            {erreursChamps.motDePasse}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Ce mot de passe n&apos;est jamais envoyé par email : communiquez-le directement à l&apos;employé.
        </p>
      </div>
      {erreurGlobale && (
        <p className="text-sm text-destructive" role="alert">
          {erreurGlobale}
        </p>
      )}
      {succes && (
        <p className="text-sm text-green-600" role="status">
          Compte employé créé.
        </p>
      )}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Création en cours..." : "Créer le compte"}
      </Button>
    </form>
  );
}
