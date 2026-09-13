import Link from "next/link";

const HORAIRES = [
  { jour: "Lundi - Vendredi", plage: "9h - 19h" },
  { jour: "Samedi", plage: "9h - 18h" },
  { jour: "Dimanche", plage: "Sur rendez-vous" },
];

export function Footer() {
  return (
    <footer className="w-full bg-foreground text-background">
      <div className="mx-auto grid max-w-5xl gap-8 px-5 py-12 sm:grid-cols-3">
        <div>
          <p className="font-heading text-lg">Vite &amp; Gourmand</p>
          <p className="mt-2 text-sm text-background/80">
            Traiteur evenementiel a Bordeaux depuis 25 ans.
          </p>
          <p className="mt-4 text-sm text-background/60">
            &copy; {new Date().getFullYear()} Vite &amp; Gourmand
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide">Horaires</h2>
          <dl className="mt-3 space-y-1 text-sm text-background/80">
            {HORAIRES.map((h) => (
              <div key={h.jour} className="flex justify-between gap-4">
                <dt>{h.jour}</dt>
                <dd>{h.plage}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide">Informations</h2>
          <ul className="mt-3 space-y-1 text-sm">
            <li>
              <Link
                href="/contact"
                className="underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
              >
                Nous contacter
              </Link>
            </li>
            <li>
              <Link
                href="/mentions-legales"
                className="underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
              >
                Mentions legales
              </Link>
            </li>
            <li>
              <Link
                href="/cgv"
                className="underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
              >
                Conditions generales de vente
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
