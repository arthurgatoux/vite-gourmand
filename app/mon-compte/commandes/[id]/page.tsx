import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCommandeDetail } from '@/lib/supabase/mon-compte-queries'
import { CommandeDetailView } from '@/components/mon-compte/commande-detail-view'
import { ModifierAnnulerCommande } from '@/components/mon-compte/modifier-annuler-commande'
import { DeposerAvis } from '@/components/mon-compte/deposer-avis'
import Link from 'next/link'

type PageProps = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  return {
    title: `Commande ${id.slice(0, 8)}... - Vite Gourmand`,
    description: 'Détail et suivi de votre commande de menu événementiel.',
  }
}

export default async function CommandeDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/auth/login?redirect=/mon-compte/commandes/${id}`)
  }

  const commande = await getCommandeDetail(id, user.id)

  if (!commande) {
    notFound()
  }

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-16">
      <nav aria-label="Fil d'Ariane" className="mb-8 text-sm text-muted-foreground">
        <Link href="/" className="hover:underline">Accueil</Link>
        <span aria-hidden="true" className="mx-2">›</span>
        <Link href="/mon-compte/commandes" className="hover:underline">Mes commandes</Link>
        <span aria-hidden="true" className="mx-2">›</span>
        <span className="font-bold text-foreground">Commande {id.slice(0, 8)}...</span>
      </nav>

      <CommandeDetailView commande={commande} />
      <ModifierAnnulerCommande commande={commande} />
      {commande.statutCourant === 'termine' && (
        <DeposerAvis commandeId={commande.id} avisExistant={commande.avis} />
      )}
    </main>
  )
}
