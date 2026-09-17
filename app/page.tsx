import { PresentationSection } from "@/components/home/presentation-section";
import { EquipeSection } from "@/components/home/equipe-section";
import { AvisSection } from "@/components/home/avis-section";
import { CtaSection } from "@/components/home/cta-section";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center">
      <PresentationSection />
      <EquipeSection />
      <AvisSection />
      <CtaSection />
    </main>
  );
}
