import { getHorairesEmploye } from '@/lib/supabase/horaires-employe-queries'
import { HorairesForm } from '@/components/employe/horaires-form'
import { EmployeNav } from '@/components/employe/employe-nav'

export const metadata = {
  title: 'Gestion des horaires - Vite Gourmand',
  description: "Modification des horaires d'ouverture affichés en pied de page.",
}

export default async function EmployeHorairesPage() {
  const horaires = await getHorairesEmploye()

  return (
    <>
      <div className="mb-10 flex flex-col items-center gap-4 text-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-primary">Espace employé</p>
          <h1 className="mt-3 font-heading text-4xl lg:text-5xl">Gestion des horaires</h1>
        </div>
        <EmployeNav />
      </div>
      <HorairesForm horaires={horaires} />
    </>
  )
}
