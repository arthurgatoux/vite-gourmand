import { notFound } from "next/navigation";
import { getMenuDetail } from "@/lib/supabase/menu-detail-queries";
import { getCurrentProfile } from "@/lib/supabase/get-current-profile";
import { MenuDetailView } from "@/components/menus/menu-detail-view";

type MenuDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function MenuDetailPage({ params }: MenuDetailPageProps) {
  const { id } = await params;
  const [menu, profil] = await Promise.all([getMenuDetail(id), getCurrentProfile()]);

  if (!menu) {
    notFound();
  }

  return <MenuDetailView menu={menu} estAuthentifie={profil !== null} />;
}

export async function generateMetadata({ params }: MenuDetailPageProps) {
  const { id } = await params;
  const menu = await getMenuDetail(id);
  return {
    title: menu ? `${menu.titre} — Vite & Gourmand` : "Menu introuvable",
    description: menu?.description ?? undefined,
  };
}
