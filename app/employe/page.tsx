import { getCommandesEmploye, getAvisEnAttente } from '@/lib/supabase/employe-queries'
import { CommandesFiltrees } from '@/components/employe/commandes-filtrees'
import { AvisAValider } from '@/components/employe/avis-a-valider'

export const metadata = {
  title: 'Espace employé - Vite Gourmand',
  description: 'Gestion des commandes.',
}

export default async function EmployePage() {
  const [commandes, avis] = await Promise.all([getCommandesEmploye(), getAvisEnAttente()])

  return (
    <>
      <div className="mb-10 text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-primary">
          Espace employé
        </p>
        <h1 className="mt-3 font-heading text-4xl lg:text-5xl">Gestion des commandes</h1>
      </div>

      <CommandesFiltrees commandes={commandes} />

      <div className="mt-16">
        <h2 className="font-heading text-2xl lg:text-3xl">Avis clients à valider</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Un avis validé devient visible sur la page d'accueil.
        </p>
        <div className="mt-6">
          <AvisAValider avis={avis} />
        </div>
      </div>
    </>
  )
}
