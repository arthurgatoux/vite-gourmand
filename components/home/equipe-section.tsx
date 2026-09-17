import { Wheat, GlassWater, PenLine } from "lucide-react";
import Image from "next/image";

const ENGAGEMENTS = [
  {
    icon: Wheat,
    titre: "La qualité des produits",
    description:
      "Des ingrédients frais, locaux et rigoureusement sélectionnés au fil des saisons.",
  },
  {
    icon: GlassWater,
    titre: "L'expérience événementielle",
    description:
      "25 ans de maîtrise, du dîner intime aux réceptions de grande ampleur.",
  },
  {
    icon: PenLine,
    titre: "Le sur-mesure",
    description:
      "Un menu, une scénographie et un service pensés pour votre histoire.",
  },
];

export function EquipeSection() {
  return (
    <section aria-labelledby="equipe-heading" className="w-full bg-background py-24">
      <div className="mx-auto grid max-w-6xl gap-16 px-6 lg:grid-cols-2 lg:items-center">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-accent">
          <Image
            src="/images/julie-jose-vite-gourmand.webp"
            alt="Julie et José, fondateurs de Vite et Gourmand, dans leur cuisine"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>

        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-primary">
            Une histoire de goût
          </p>
          <h2 id="equipe-heading" className="mt-3 font-heading text-4xl lg:text-5xl">
            Julie &amp; José, une passion partagée depuis 25 ans
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            À Bordeaux, notre maison imagine des réceptions qui ressemblent à
            celles et ceux qui les célèbrent. Julie orchestre chaque détail,
            José compose une cuisine sincère, inspirée des saisons et de notre
            terroir.
          </p>
          <p className="mt-4 font-heading text-xl italic text-primary">
            &laquo; Recevoir, c&apos;est créer un souvenir autour d&apos;une table. &raquo;
          </p>
        </div>
      </div>

      <div className="mx-auto mt-20 max-w-6xl px-6">
        <p className="text-center text-sm font-bold uppercase tracking-widest text-primary">
          Notre engagement
        </p>
        <h2 className="mt-3 text-center font-heading text-4xl">
          L&apos;exigence dans chaque détail
        </h2>
        <ul className="mt-12 grid gap-6 sm:grid-cols-3">
          {ENGAGEMENTS.map((item) => (
            <li
              key={item.titre}
              className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-secondary p-8 text-center shadow-card"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-foreground">
                <item.icon aria-hidden="true" className="h-6 w-6" />
              </span>
              <h3 className="font-heading text-xl">{item.titre}</h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
