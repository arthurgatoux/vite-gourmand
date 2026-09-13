import { getHorairesEmploye } from '@/lib/supabase/horaires-employe-queries'
import { HorairesForm } from '@/components/employe/horaires-form'

export const metadata = {
  title: 'Gestion des horaires - Vite Gourmand',
  description: "Modification des horaires d'ouverture affiches en pied de page.",
}

export default async function EmployeHorairesPage() {
  const horaires = await getHorairesEmploye()

  return (
    <>
      <div className="mb-10 text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-primary">Espace employé</p>
        <h1 className="mt-3 font-heading text-4xl lg:text-5xl">Gestion des horaires</h1>
      </div>
      <HorairesForm horaires={horaires} />
    </>
  )
}
