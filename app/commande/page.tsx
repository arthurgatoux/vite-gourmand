import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getMenuPourCommande,
  getProfilPourCommande,
} from "@/lib/supabase/commande-queries";
import { CommandeForm } from "@/components/commande/commande-form";

type CommandePageProps = {
  searchParams: Promise<{ menu?: string }>;
};

export default async function CommandePage({ searchParams }: CommandePageProps) {
  const { menu: menuId } = await searchParams;
  if (!menuId) {
    notFound();
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  // Redirection vers le login si pas connecté (en conservant l'ID du menu dans l'URL)
  if (error || !data?.claims) {
    redirect(`/auth/login?redirect=/commande?menu=${menuId}`);
  }

  const userId = data.claims.sub as string;
  // Fetch en parallèle du menu sélectionné et du profil utilisateur pour le préremplissage
  const [menu, profil] = await Promise.all([
    getMenuPourCommande(menuId),
    getProfilPourCommande(userId),
  ]);

  if (!menu) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
      <div className="mb-10 text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-primary">
          Finaliser votre événement
        </p>
        <h1 className="mt-3 font-heading text-4xl lg:text-5xl">
          Commander {menu.titre}
        </h1>
      </div>
      <CommandeForm menu={menu} profil={profil} />
    </main>
  );
}
