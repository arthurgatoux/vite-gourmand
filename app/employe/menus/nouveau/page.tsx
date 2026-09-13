import { getPlatsDisponibles, getRegimesDisponibles } from '@/lib/supabase/menus-employe-queries'
import { MenuForm } from '@/components/employe/menu-form'

export const metadata = {
  title: 'Nouveau menu - Vite Gourmand',
}

export default async function NouveauMenuPage() {
  const [plats, regimes] = await Promise.all([getPlatsDisponibles(), getRegimesDisponibles()])

  return (
    <>
      <div className="mb-10 text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-primary">Espace employé</p>
        <h1 className="mt-3 font-heading text-4xl lg:text-5xl">Nouveau menu</h1>
      </div>
      <MenuForm plats={plats} regimes={regimes} />
    </>
  )
}
