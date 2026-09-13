import { MenusCatalogueClient } from "@/components/menus/menus-catalogue";

export const metadata = {
  title: "Nos menus — Vite & Gourmand",
  description:
    "Decouvrez nos menus evenementiels et filtrez par prix, theme, regime et nombre de personnes.",
};

export default function MenusPage() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-16">
      <div className="mb-10 text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-primary">
          La table de vos evenements
        </p>
        <h1 className="mt-3 font-heading text-4xl lg:text-5xl">Nos menus evenementiels</h1>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          Des compositions genereuses et de saison, imaginees a Bordeaux pour
          celebrer chaque moment avec goût.
        </p>
      </div>

      <MenusCatalogueClient />
    </main>
  );
}
