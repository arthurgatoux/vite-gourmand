import { AvisCard } from "@/components/home/avis-card";
import { getAvisPublics } from "@/lib/supabase/queries";

export async function AvisSection() {
  const avis = await getAvisPublics();

  if (avis.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="avis-heading" className="w-full bg-secondary py-16">
      <div className="mx-auto max-w-5xl px-5">
        <p className="text-center text-sm font-semibold uppercase tracking-wide text-primary">
          Vos mots comptent
        </p>
        <h2 id="avis-heading" className="mt-2 text-center text-3xl font-heading">
          Ils nous ont confie leur evenement
        </h2>
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
