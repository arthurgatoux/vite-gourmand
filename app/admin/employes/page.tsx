import { listerComptesEmployes } from "@/lib/supabase/admin-queries";
import { CreerEmployeForm } from "@/components/admin/creer-employe-form";
import { ComptesEmployesListe } from "@/components/admin/comptes-employes-liste";

export const metadata = {
  title: "Comptes employe - Vite Gourmand",
};

export default async function AdminEmployesPage() {
  const comptes = await listerComptesEmployes();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <p className="text-sm font-bold uppercase tracking-widest text-primary">Espace administrateur</p>
      <h1 className="mt-1 font-heading text-3xl">Comptes employe</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        La creation d&apos;un compte administrateur reste impossible depuis l&apos;application.
      </p>
      <div className="mt-8">
        <CreerEmployeForm />
      </div>
      <div className="mt-8">
        <ComptesEmployesListe comptes={comptes} />
      </div>
    </div>
  );
}
