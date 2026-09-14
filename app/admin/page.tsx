import Link from "next/link";
import { getCurrentProfile } from "@/lib/supabase/get-current-profile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function AdminPage() {
  const profil = await getCurrentProfile();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 rounded-lg bg-neutral-900 px-6 py-8 text-white">
        <p className="text-sm uppercase tracking-wide text-amber-500">Espace administrateur</p>
        <h1 className="mt-1 text-2xl font-semibold">
          Bienvenue{profil?.prenom ? `, ${profil.prenom}` : ""}
        </h1>
        <p className="mt-2 text-neutral-300">
          Gestion des comptes employé et suivi de l&apos;activité de Vite Gourmand.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Comptes employé</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Créer ou désactiver des comptes employé. La création d&apos;un compte administrateur reste
              impossible depuis l&apos;application.
            </p>
            <Button asChild size="sm" variant="secondary">
              <Link href="/admin/employes">Gérer les comptes employé</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Dashboard statistique</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Nombre de commandes par menu, chiffre d&apos;affaires et comparatif graphique, alimentés par la
              base NoSQL dédiée.
            </p>
            <Button asChild size="sm" variant="secondary">
              <Link href="/admin/dashboard">Voir les statistiques</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      <div className="mt-8">
        <Button asChild variant="outline" size="sm">
          <Link href="/employe">Accéder à l&apos;espace employé</Link>
        </Button>
      </div>
    </div>
  );
}
