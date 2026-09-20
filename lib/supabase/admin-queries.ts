import { createClient } from "./server";

export interface CompteEmploye {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  compteActif: boolean;
  dateCreation: string;
}

// Récupère la liste des employés pour la gestion d'équipe côté admin
export async function listerComptesEmployes(): Promise<CompteEmploye[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profils")
    .select("id, nom, prenom, email, compte_actif, date_creation")
    .eq("role", "employe")
    .order("date_creation", { ascending: false });

  if (error || !data) {
    console.error("Erreur lors de la recuperation des comptes employe :", error?.message);
    return [];
  }

  return data.map((p) => ({
    id: p.id,
    nom: p.nom,
    prenom: p.prenom,
    email: p.email,
    compteActif: p.compte_actif,
    dateCreation: p.date_creation,
  }));
}
