import { Button } from "@/components/ui/button";
import Link from "next/link";

export function PresentationSection() {
  return (
    <section
      aria-labelledby="presentation-heading"
      className="w-full bg-background py-20"
    >
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-5 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">
          Traiteur bordelais &middot; Maison familiale &agrave; Bordeaux depuis 2001
        </p>
        <h1 id="presentation-heading" className="text-4xl font-heading lg:text-5xl">
          25 ans de savoir-faire culinaire au service de vos evenements
        </h1>
        <p className="text-lg text-muted-foreground">
          Receptions privees, mariages et evenements professionnels imagines
          avec goût, generosite et precision.
        </p>
        <Button asChild size="lg">
          <Link href="/menus">Decouvrir nos menus</Link>
        </Button>
      </div>
    </section>
  );
}
