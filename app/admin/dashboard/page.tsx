import { listerStatsMenus } from "@/lib/mongodb/stats-menus-queries";
import { DashboardStats } from "@/components/admin/dashboard-stats";

export const metadata = {
  title: "Dashboard statistique - Vite Gourmand",
};

export default async function AdminDashboardPage() {
  const stats = await listerStatsMenus();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <p className="text-sm font-bold uppercase tracking-widest text-primary">Espace administrateur</p>
      <h1 className="mt-1 font-heading text-3xl">Dashboard statistique</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Donnees issues de la base non relationnelle (MongoDB Atlas), alimentee automatiquement a chaque
        commande terminee.
      </p>
      <div className="mt-8">
        <DashboardStats stats={stats} />
      </div>
    </div>
  );
}
