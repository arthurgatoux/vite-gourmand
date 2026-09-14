import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/supabase/get-current-profile'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Mon espace - Vite Gourmand',
  description: 'Gérez vos commandes et vos informations personnelles.',
}

export default async function MonComptePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/mon-compte')
  }

  const profil = await getCurrentProfile()

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-16">
      <div className="mb-10 text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-primary">
          Espace utilisateur
        </p>
        <h1 className="mt-3 font-heading text-4xl lg:text-5xl">
          Bonjour {profil?.prenom ?? ''}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          Retrouvez ici vos commandes et vos informations personnelles.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg font-heading">Mes commandes</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Consultez l'historique et le suivi de vos commandes de menus événementiels.
            </p>
            <Button asChild className="w-full">
              <Link href="/mon-compte/commandes">Voir mes commandes</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg font-heading">Mes informations</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Modifiez votre nom, prénom, téléphone et adresse postale.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/mon-compte/profil">Modifier mes informations</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
