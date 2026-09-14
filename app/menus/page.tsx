import { MenusCatalogueClient } from "@/components/menus/menus-catalogue";

export const metadata = {
  title: "Nos menus — Vite & Gourmand",
  description:
    "Découvrez nos menus événementiels et filtrez par prix, thème, régime et nombre de personnes.",
};

export default function MenusPage() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-16">
      <div className="mb-10 text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-primary">
          La table de vos événements
        </p>
        <h1 className="mt-3 font-heading text-4xl lg:text-5xl">Nos menus événementiels</h1>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          Des compositions généreuses et de saison, imaginées à Bordeaux pour
          célébrer chaque moment avec goût.
        </p>
      </div>

      <MenusCatalogueClient />
    </main>
  );
}
