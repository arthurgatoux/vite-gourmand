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
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { validerConnexion, type ChampConnexion } from "@/lib/validations/auth";

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreursChamps, setErreursChamps] = useState<Partial<Record<ChampConnexion, string>>>({});
  const [erreurGlobale, setErreurGlobale] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreurGlobale(null);

    const erreurs = validerConnexion({ email, motDePasse });
    setErreursChamps(erreurs);
    if (Object.keys(erreurs).length > 0) return;

    const supabase = createClient();
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password: motDePasse });
      if (error) throw error;

      // Redirection vers l'URL d'origine (ex: /commande) si c'est un chemin relatif valide, sinon retour accueil
      const destination = searchParams.get("redirect");
      const cible = destination && destination.startsWith("/") ? destination : "/";
      router.push(cible);
      router.refresh();
    } catch {
      // Erreur générique côté UI pour la sécurité (évite l'énumération d'emails)
      setErreurGlobale("Email ou mot de passe incorrect.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Connexion</CardTitle>
          <CardDescription>Accédez à votre espace Vite Gourmand</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} noValidate>
            <div className="flex flex-col gap-6">
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
                <div className="flex items-center">
                  <Label htmlFor="motDePasse">Mot de passe</Label>
                  <Link
                    href="/auth/forgot-password"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>
                <Input
                  id="motDePasse"
                  type="password"
                  autoComplete="current-password"
                  required
                  aria-invalid={Boolean(erreursChamps.motDePasse)}
                  aria-describedby={erreursChamps.motDePasse ? "motdepasse-erreur" : undefined}
                  value={motDePasse}
                  onChange={(e) => setMotDePasse(e.target.value)}
                />
                {erreursChamps.motDePasse && (
                  <p id="motdepasse-erreur" className="text-sm text-red-500">
                    {erreursChamps.motDePasse}
                  </p>
                )}
              </div>
              {erreurGlobale && (
                <p className="text-sm text-red-500" role="alert">
                  {erreurGlobale}
                </p>
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Connexion..." : "Se connecter"}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Vous n&apos;avez pas de compte ?{" "}
              <Link href="/auth/sign-up" className="underline underline-offset-4">
                Créer un compte
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
