import { Button } from "@/components/ui/button";
import Link from "next/link";

export function CtaSection() {
  return (
    <section aria-labelledby="cta-heading" className="w-full bg-primary py-20">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-6 text-center text-primary-foreground">
        <p className="text-sm font-bold uppercase tracking-widest text-accent">
          Votre prochain evenement
        </p>
        <h2 id="cta-heading" className="font-heading text-4xl">
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
