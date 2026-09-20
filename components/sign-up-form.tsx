"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { validerInscription, type ChampInscription } from "@/lib/validations/auth";

export function SignUpForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [adressePostale, setAdressePostale] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [confirmationMotDePasse, setConfirmationMotDePasse] = useState("");
  const [erreursChamps, setErreursChamps] = useState<Partial<Record<ChampInscription, string>>>({});
  const [erreurGlobale, setErreurGlobale] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreurGlobale(null);

    const erreurs = validerInscription({
      nom,
      prenom,
      email,
      telephone,
      adressePostale,
      motDePasse,
      confirmationMotDePasse,
    });
    setErreursChamps(erreurs);
    if (Object.keys(erreurs).length > 0) return;

    const supabase = createClient();
    setIsLoading(true);
    try {
      // Inscription utilisateur (le rôle 'utilisateur' est forcé côté Supabase via le trigger SQL)
      const { error } = await supabase.auth.signUp({
        email,
        password: motDePasse,
        options: {
          emailRedirectTo: `${window.location.origin}/protected`,
          data: { nom, prenom, telephone, adresse_postale: adressePostale },
        },
      });
      if (error) throw error;
      router.push("/auth/sign-up-success");
    } catch (error: unknown) {
      setErreurGlobale(error instanceof Error ? error.message : "Une erreur est survenue.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Créer un compte</CardTitle>
          <CardDescription>Renseignez vos informations pour commander vos menus événementiels</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} noValidate>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="nom">Nom</Label>
                  <Input
                    id="nom"
                    type="text"
                    autoComplete="family-name"
                    required
                    aria-invalid={Boolean(erreursChamps.nom)}
                    aria-describedby={erreursChamps.nom ? "nom-erreur" : undefined}
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                  />
                  {erreursChamps.nom && (
                    <p id="nom-erreur" className="text-sm text-red-500">
                      {erreursChamps.nom}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="prenom">Prénom</Label>
                  <Input
                    id="prenom"
                    type="text"
                    autoComplete="given-name"
                    required
                    aria-invalid={Boolean(erreursChamps.prenom)}
                    aria-describedby={erreursChamps.prenom ? "prenom-erreur" : undefined}
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                  />
                  {erreursChamps.prenom && (
                    <p id="prenom-erreur" className="text-sm text-red-500">
                      {erreursChamps.prenom}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="m@example.com"
                  required
                  aria-invalid={Boolean(erreursChamps.email)}
                  aria-describedby={erreursChamps.email ? "email-erreur" : undefined}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {erreursChamps.email && (
                  <p id="email-erreur" className="text-sm text-red-500">
                    {erreursChamps.email}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="telephone">Numéro de GSM</Label>
                <Input
                  id="telephone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="06 12 34 56 78"
                  required
                  aria-invalid={Boolean(erreursChamps.telephone)}
                  aria-describedby={erreursChamps.telephone ? "telephone-erreur" : undefined}
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                />
                {erreursChamps.telephone && (
                  <p id="telephone-erreur" className="text-sm text-red-500">
                    {erreursChamps.telephone}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="adressePostale">Adresse postale</Label>
                <Input
                  id="adressePostale"
                  type="text"
                  autoComplete="street-address"
                  placeholder="12 rue des Fêtes, 33000 Bordeaux"
                  required
                  aria-invalid={Boolean(erreursChamps.adressePostale)}
                  aria-describedby={erreursChamps.adressePostale ? "adressePostale-erreur" : undefined}
                  value={adressePostale}
                  onChange={(e) => setAdressePostale(e.target.value)}
                />
                {erreursChamps.adressePostale && (
                  <p id="adressePostale-erreur" className="text-sm text-red-500">
                    {erreursChamps.adressePostale}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="motDePasse">Mot de passe</Label>
                <Input
                  id="motDePasse"
                  type="password"
                  autoComplete="new-password"
                  required
                  aria-invalid={Boolean(erreursChamps.motDePasse)}
                  aria-describedby={cn("mot-de-passe-aide", erreursChamps.motDePasse && "motdepasse-erreur")}
                  value={motDePasse}
                  onChange={(e) => setMotDePasse(e.target.value)}
                />
                {erreursChamps.motDePasse && (
                  <p id="motdepasse-erreur" className="text-sm text-red-500">
                    {erreursChamps.motDePasse}
                  </p>
                )}
                <p id="mot-de-passe-aide" className="text-xs text-muted-foreground">
                  10 caractères minimum, avec une majuscule, une minuscule, un chiffre et un caractère spécial.
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmationMotDePasse">Confirmer le mot de passe</Label>
                <Input
                  id="confirmationMotDePasse"
                  type="password"
                  autoComplete="new-password"
                  required
                  aria-invalid={Boolean(erreursChamps.confirmationMotDePasse)}
                  aria-describedby={
                    erreursChamps.confirmationMotDePasse ? "confirmation-mdp-erreur" : undefined
                  }
                  value={confirmationMotDePasse}
                  onChange={(e) => setConfirmationMotDePasse(e.target.value)}
                />
                {erreursChamps.confirmationMotDePasse && (
                  <p id="confirmation-mdp-erreur" className="text-sm text-red-500">
                    {erreursChamps.confirmationMotDePasse}
                  </p>
                )}
              </div>
              {erreurGlobale && (
                <p className="text-sm text-red-500" role="alert">
                  {erreurGlobale}
                </p>
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Création du compte..." : "Créer mon compte"}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Vous avez déjà un compte ?{" "}
              <Link href="/auth/login" className="underline underline-offset-4">
                Se connecter
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
