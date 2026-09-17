import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { MenuCatalogue } from "@/lib/supabase/menus-queries";

export function MenuCard({ menu }: { menu: MenuCatalogue }) {
  return (
    <li className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-card">
      <div className="aspect-[16/9] w-full overflow-hidden bg-gradient-to-br from-primary to-accent">
        {menu.image_principale ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={menu.image_principale}
            alt={`Photo du menu ${menu.titre}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className="h-full w-full"
            role="img"
            aria-label={`Aucune photo disponible pour le menu ${menu.titre}`}
          />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6">
        <div className="flex flex-wrap gap-2">
          {menu.theme && (
            <Badge variant="default" className="bg-accent text-foreground">
              {menu.theme}
            </Badge>
          )}
          {menu.regimes.map((regime) => (
            <Badge key={regime} variant="outline">
              {regime}
            </Badge>
          ))}
        </div>
        <h3 className="font-heading text-2xl">{menu.titre}</h3>
        {menu.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{menu.description}</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-2">
          <p className="font-bold text-primary">à partir de {menu.prix_base}€</p>
          <p className="text-sm font-medium text-muted-foreground">Dès {menu.nb_personnes_min} pers.</p>
        </div>
        <Button asChild className="w-full">
          <Link href={`/menus/${menu.id}`}>Voir le détail</Link>
        </Button>
      </div>
    </li>
  );
}
