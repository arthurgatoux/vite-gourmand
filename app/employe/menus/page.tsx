import Link from 'next/link'
import { getMenusEmploye } from '@/lib/supabase/menus-employe-queries'
import { MenusListe } from '@/components/employe/menus-liste'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Gestion des menus - Vite Gourmand',
  description: 'Creation, modification et suppression des menus.',
}

export default async function EmployeMenusPage() {
  const menus = await getMenusEmploye()

  return (
    <>
      <div className="mb-10 flex flex-col items-center gap-4 text-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-primary">Espace employé</p>
          <h1 className="mt-3 font-heading text-4xl lg:text-5xl">Gestion des menus</h1>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/employe/plats">Gérer les plats</Link>
        </Button>
      </div>
      <MenusListe menus={menus} />
    </>
  )
}
