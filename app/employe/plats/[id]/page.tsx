import { notFound } from 'next/navigation'
import { getPlatPourEdition, getAllergenesDisponibles } from '@/lib/supabase/plats-employe-queries'
import { PlatForm } from '@/components/employe/plat-form'

export const metadata = {
  title: 'Modifier le plat - Vite Gourmand',
}

interface EditerPlatPageProps {
  params: Promise<{ id: string }>
}

export default async function EditerPlatPage({ params }: EditerPlatPageProps) {
  const { id } = await params
  const [plat, allergenes] = await Promise.all([getPlatPourEdition(id), getAllergenesDisponibles()])

  if (!plat) notFound()

  return (
    <>
      <div className="mb-10 text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-primary">Espace employé</p>
        <h1 className="mt-3 font-heading text-4xl lg:text-5xl">Modifier {plat.nom}</h1>
      </div>
      <PlatForm plat={plat} allergenes={allergenes} />
    </>
  )
}
