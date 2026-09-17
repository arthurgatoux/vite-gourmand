import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/supabase/get-current-profile";

export default async function EmployeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profil = await getCurrentProfile();

  if (
    !profil ||
    (profil.role !== "employe" && profil.role !== "administrateur") ||
    !profil.compte_actif
  ) {
    redirect("/auth/login?redirect=/employe");
  }

  return <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-16">{children}</main>;
}
