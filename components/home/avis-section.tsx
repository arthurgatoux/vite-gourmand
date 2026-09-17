import { AvisCard } from "@/components/home/avis-card";
import { getAvisPublics } from "@/lib/supabase/queries";

export async function AvisSection() {
  const avis = await getAvisPublics();

  if (avis.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="avis-heading" className="w-full bg-secondary py-20">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-center text-sm font-bold uppercase tracking-widest text-primary">
          Vos mots comptent
        </p>
        <h2 id="avis-heading" className="mt-3 text-center font-heading text-4xl">
          Ils nous ont confié leur événement
        </h2>
        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {avis.map((item) => (
            <li key={item.id}>
              <AvisCard avis={item} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
