import { getAllergenesDisponibles } from '@/lib/supabase/plats-employe-queries'
import { PlatForm } from '@/components/employe/plat-form'

export const metadata = {
  title: 'Nouveau plat - Vite Gourmand',
}

export default async function NouveauPlatPage() {
  const allergenes = await getAllergenesDisponibles()

  return (
    <>
      <div className="mb-10 text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-primary">Espace employé</p>
        <h1 className="mt-3 font-heading text-4xl lg:text-5xl">Nouveau plat</h1>
      </div>
      <PlatForm allergenes={allergenes} />
    </>
  )
}
