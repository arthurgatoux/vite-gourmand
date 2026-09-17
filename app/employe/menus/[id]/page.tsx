import { notFound } from 'next/navigation'
import { getMenuPourEdition, getPlatsDisponibles, getRegimesDisponibles } from '@/lib/supabase/menus-employe-queries'
import { MenuForm } from '@/components/employe/menu-form'

export const metadata = {
  title: 'Modifier le menu - Vite Gourmand',
}

interface EditerMenuPageProps {
  params: Promise<{ id: string }>
}

export default async function EditerMenuPage({ params }: EditerMenuPageProps) {
  const { id } = await params
  const [menu, plats, regimes] = await Promise.all([
    getMenuPourEdition(id),
    getPlatsDisponibles(),
    getRegimesDisponibles(),
  ])

  if (!menu) notFound()

  return (
    <>
      <div className="mb-10 text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-primary">Espace employé</p>
        <h1 className="mt-3 font-heading text-4xl lg:text-5xl">Modifier {menu.titre}</h1>
      </div>
      <MenuForm menu={menu} plats={plats} regimes={regimes} />
    </>
  )
}
