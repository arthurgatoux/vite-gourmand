import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { MenuDetail } from "@/lib/supabase/menu-detail-queries";

const LABEL_PLAT: Record<string, string> = {
  entree: "Entrée",
  plat: "Plat",
  dessert: "Dessert",
};

interface MenuDetailViewProps {
  menu: MenuDetail;
  estAuthentifie: boolean;
}

export function MenuDetailView({ menu, estAuthentifie }: MenuDetailViewProps) {
  const hrefCommande = estAuthentifie
    ? `/commande?menu=${menu.id}`
    : `/auth/login?redirect=/commande?menu=${menu.id}`;

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
      <nav aria-label="Fil d'ariane" className="mb-8 text-sm text-muted-foreground">
        <Link href="/" className="hover:underline">
          Accueil
        </Link>
        <span aria-hidden="true"> › </span>
        <Link href="/menus" className="hover:underline">
          Nos menus
        </Link>
        <span aria-hidden="true"> › </span>
        <span className="font-bold text-foreground">{menu.titre}</span>
      </nav>

      <div className="grid gap-14 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <div className="aspect-[4/3] w-full overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-accent">
            {menu.images.length > 0 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={menu.images[0]}
                alt={`Photo principale du menu ${menu.titre}`}
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
          {menu.images.length > 1 && (
            <ul className="flex gap-3">
              {menu.images.slice(1).map((url, index) => (
                <li
                  key={url}
                  className="h-20 flex-1 overflow-hidden rounded-xl border-2 border-border bg-secondary focus-within:border-primary"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`Photo ${index + 2} du menu ${menu.titre}`}
                    className="h-full w-full object-cover"
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-primary">Menu de saison</p>
            <h1 className="mt-2 font-heading text-4xl lg:text-5xl">{menu.titre}</h1>
            {menu.description && (
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">{menu.description}</p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              {menu.theme && <Badge className="bg-accent text-foreground">{menu.theme}</Badge>}
              {menu.regimes.map((regime) => (
                <Badge key={regime} variant="outline">
                  {regime}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between border-y border-border py-5">
            <div>
              <p className="text-sm text-muted-foreground">Minimum</p>
              <p className="text-lg font-bold">{menu.nbpersonnesmin} personnes</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Pour {menu.nbpersonnesmin} personnes</p>
              <p className="font-heading text-3xl text-primary">{menu.prixbase}€</p>
            </div>
          </div>

          <Button asChild size="lg" className="w-full">
            <Link href={hrefCommande}>Commander ce menu</Link>
          </Button>

          {menu.conditions && (
            <div className="flex gap-4 rounded-xl border-2 border-accent bg-secondary p-5">
              <TriangleAlert aria-hidden="true" className="h-6 w-6 flex-shrink-0 text-primary" />
              <div>
                <p className="font-extrabold">Conditions de ce menu</p>
                <p className="mt-2 text-sm font-bold">{menu.conditions}</p>
                {menu.delaicommandejours !== null && (
                  <p className="mt-1 text-sm font-bold">
                    Commande au minimum {menu.delaicommandejours} jours à l&apos;avance
                  </p>
                )}
              </div>
            </div>
          )}

          {menu.stockdisponible !== null && (
            <p className="text-sm text-muted-foreground">
              {menu.stockdisponible > 0
                ? `Il reste ${menu.stockdisponible} commande${menu.stockdisponible > 1 ? "s" : ""} possible${
                    menu.stockdisponible > 1 ? "s" : ""
                  } pour ce menu.`
                : "Ce menu n'est plus disponible pour le moment."}
            </p>
          )}
        </div>
      </div>

      <section aria-labelledby="composition-heading" className="mt-16">
        <h2 id="composition-heading" className="font-heading text-3xl">
          Composition du menu
        </h2>
        <p className="mt-2 text-muted-foreground">
          Trois temps imaginés par notre chef, préparés dans notre atelier le jour du retrait.
        </p>
        <ul className="mt-8 grid gap-6 sm:grid-cols-3">
          {menu.plats.map((plat) => (
            <li key={plat.nom} className="rounded-2xl border border-border bg-background p-7 shadow-card">
              <p className="text-xs font-bold uppercase tracking-widest text-primary">
                {LABEL_PLAT[plat.typeplat] ?? plat.typeplat}
              </p>
              <h3 className="mt-2 font-heading text-xl">{plat.nom}</h3>
              {plat.description && (
                <p className="mt-2 text-sm text-muted-foreground">{plat.description}</p>
              )}
              {plat.allergenes.length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-2">
                  {plat.allergenes.map((allergene) => (
                    <li key={allergene}>
                      <Badge variant="outline" className="text-xs">
                        {allergene}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
