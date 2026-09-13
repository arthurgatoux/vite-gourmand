import { Button } from "@/components/ui/button";
import Link from "next/link";

export function CtaSection() {
  return (
    <section aria-labelledby="cta-heading" className="w-full bg-primary py-16">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-5 text-center text-primary-foreground">
        <h2 id="cta-heading" className="text-3xl font-heading">
          Creons ensemble un moment inoubliable
        </h2>
        <p className="text-primary-foreground/90">
          Parlez-nous de vos envies, nous imaginons la suite.
        </p>
        <Button asChild size="lg" variant="secondary">
          <Link href="/contact">Demander un devis</Link>
        </Button>
      </div>
    </section>
  );
}
