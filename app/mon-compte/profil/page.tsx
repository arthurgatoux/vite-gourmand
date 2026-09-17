import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getProfilComplet } from '@/lib/supabase/profil-queries'
import { ModifierProfilForm } from '@/components/mon-compte/modifier-profil-form'

export const metadata = {
  title: 'Mes informations personnelles - Vite Gourmand',
  description: 'Modifiez vos informations personnelles.',
}

export default async function ProfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/mon-compte/profil')
  }

  const profil = await getProfilComplet(user.id)

  if (!profil) {
    redirect('/mon-compte')
  }

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
      <div className="mb-10 text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-primary">
          Espace utilisateur
        </p>
        <h1 className="mt-3 font-heading text-4xl lg:text-5xl">Mes informations personnelles</h1>
      </div>

      <ModifierProfilForm profil={profil} />
    </main>
  )
}
