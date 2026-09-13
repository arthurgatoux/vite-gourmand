import { getPlatsEmploye } from '@/lib/supabase/plats-employe-queries'
import { PlatsListe } from '@/components/employe/plats-liste'

export const metadata = {
  title: 'Gestion des plats - Vite Gourmand',
  description: 'Creation, modification et suppression des plats.',
}

export default async function EmployePlatsPage() {
  const plats = await getPlatsEmploye()

  return (
    <>
      <div className="mb-10 text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-primary">Espace employé</p>
        <h1 className="mt-3 font-heading text-4xl lg:text-5xl">Gestion des plats</h1>
      </div>
      <PlatsListe plats={plats} />
    </>
  )
}
