import Link from "next/link";

const HORAIRES = [
  { jour: "Lundi - Vendredi", plage: "9h - 19h" },
  { jour: "Samedi", plage: "9h - 18h" },
  { jour: "Dimanche", plage: "Sur rendez-vous" },
];

const RESEAUX = ["Instagram", "Facebook", "Pinterest"];

export function Footer() {
  return (
    <footer className="w-full bg-foreground text-background">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-4 lg:px-11">
        <div>
          <p className="font-heading text-2xl">Vite &amp; Gourmand</p>
          <p className="mt-3 text-sm text-background/80">
            Traiteur evenementiel a Bordeaux depuis 25 ans.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide text-accent">Horaires</h2>
          <dl className="mt-3 space-y-2 text-sm text-background/90">
            {HORAIRES.map((h) => (
              <div key={h.jour} className="flex justify-between gap-4">
                <dt>{h.jour}</dt>
                <dd>{h.plage}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide text-accent">Contact</h2>
          <ul className="mt-3 space-y-2 text-sm text-background/90">
            <li>05 56 24 18 90</li>
            <li>
              <a href="mailto:bonjour@viteetgourmand.fr" className="underline-offset-4 hover:underline">
                bonjour@viteetgourmand.fr
              </a>
            </li>
            <li>Bordeaux &amp; Gironde</li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide text-accent">Suivez-nous</h2>
          <ul className="mt-3 space-y-2 text-sm text-background/90">
            {RESEAUX.map((reseau) => (
              <li key={reseau}>
                <a href="#" className="underline-offset-4 hover:underline">
                  {reseau}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-background/20">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-6 text-sm text-background/80 sm:flex-row sm:items-center sm:justify-between lg:px-11">
          <p>&copy; {new Date().getFullYear()} Vite &amp; Gourmand</p>
          <div className="flex gap-6">
            <Link href="/mentions-legales" className="underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm">
              Mentions legales
            </Link>
            <Link href="/cgv" className="underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm">
              CGV
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
