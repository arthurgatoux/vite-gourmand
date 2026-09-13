import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/supabase/get-current-profile";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profil = await getCurrentProfile();

  if (!profil || profil.role !== "administrateur" || !profil.compte_actif) {
    redirect("/auth/login?redirect=admin");
  }

  return <>{children}</>;
}
