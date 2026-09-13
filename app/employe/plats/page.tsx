import Link from 'next/link'
import { getPlatsEmploye } from '@/lib/supabase/plats-employe-queries'
import { PlatsListe } from '@/components/employe/plats-liste'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Gestion des plats - Vite Gourmand',
  description: 'Creation, modification et suppression des plats.',
}

export default async function EmployePlatsPage() {
  const plats = await getPlatsEmploye()

  return (
    <>
      <div className="mb-10 flex flex-col items-center gap-4 text-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-primary">Espace employé</p>
          <h1 className="mt-3 font-heading text-4xl lg:text-5xl">Gestion des plats</h1>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/employe/horaires">Gérer les horaires</Link>
        </Button>
      </div>
      <PlatsListe plats={plats} />
    </>
  )
}
