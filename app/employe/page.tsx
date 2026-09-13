import { getCommandesEmploye } from '@/lib/supabase/employe-queries'
import { CommandesFiltrees } from '@/components/employe/commandes-filtrees'

export const metadata = {
  title: 'Espace employé - Vite Gourmand',
  description: 'Gestion des commandes.',
}

export default async function EmployePage() {
  const commandes = await getCommandesEmploye()

  return (
    <>
      <div className="mb-10 text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-primary">
          Espace employé
        </p>
        <h1 className="mt-3 font-heading text-4xl lg:text-5xl">Gestion des commandes</h1>
      </div>

      <CommandesFiltrees commandes={commandes} />
    </>
  )
}
