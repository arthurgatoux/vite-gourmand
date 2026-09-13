import { Button } from "@/components/ui/button";
import Link from "next/link";

export function PresentationSection() {
  return (
    <section
      aria-labelledby="presentation-heading"
      className="relative w-full overflow-hidden bg-primary py-24 text-primary-foreground"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-foreground/70 via-foreground/40 to-transparent" aria-hidden="true" />
      <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-accent">
          Maison familiale &middot; Bordeaux &middot; Depuis 2001
        </p>
        <h1
          id="presentation-heading"
          className="font-heading text-5xl leading-tight sm:text-6xl lg:text-7xl"
        >
          25 ans de savoir-faire culinaire au service de vos evenements
        </h1>
        <p className="max-w-xl text-lg text-primary-foreground/90 sm:text-xl">
          Receptions privees, mariages et evenements professionnels imagines
          avec goût, generosite et precision.
        </p>
        <Button asChild size="lg" variant="secondary">
          <Link href="/menus">Decouvrir nos menus</Link>
        </Button>
      </div>
    </section>
  );
}
