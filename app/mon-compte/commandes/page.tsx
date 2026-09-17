import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCommandesUtilisateur } from '@/lib/supabase/mon-compte-queries'
import { ListeCommandes } from '@/components/mon-compte/liste-commandes'

export const metadata = {
  title: 'Mes commandes - Vite Gourmand',
  description: 'Consultez l\'historique de vos commandes de menus événementiels.',
}

export default async function MesCommandesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/mon-compte/commandes')
  }

  const commandes = await getCommandesUtilisateur(user.id)

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-16">
      <div className="mb-10 text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-primary">
          Espace utilisateur
        </p>
        <h1 className="mt-3 font-heading text-4xl lg:text-5xl">Mes commandes</h1>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          Retrouvez l'ensemble de vos commandes et suivez leur avancement en temps réel.
        </p>
      </div>

      <ListeCommandes commandes={commandes} />
    </main>
  )
}
