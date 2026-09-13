import Link from "next/link"
import { Button } from "@/components/ui/button"

const LIENS = [
  { href: "/employe", label: "Commandes" },
  { href: "/employe/menus", label: "Menus" },
  { href: "/employe/plats", label: "Plats" },
  { href: "/employe/horaires", label: "Horaires" },
]

export function EmployeNav() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {LIENS.map(lien => (
        <Button key={lien.href} asChild variant="outline" size="sm">
          <Link href={lien.href}>{lien.label}</Link>
        </Button>
      ))}
    </div>
  )
}
