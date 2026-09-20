"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "./server";
import { createAdminClient } from "./admin";
import { getCurrentProfile } from "./get-current-profile";
import { validerCreationEmploye } from "../validations/admin";

export type AdminActionResult = { success: true } | { success: false; error: string };

// Création d'un compte employé (l'email de notification est envoyé sans exposer le mot de passe)
export async function creerCompteEmploye(
  email: string,
  motDePasse: string,
): Promise<AdminActionResult> {
  const profil = await getCurrentProfile();
  if (!profil || profil.role !== "administrateur") {
    return { success: false, error: "Action réservée aux administrateurs." };
  }

  const erreurs = validerCreationEmploye(email, motDePasse);
  if (Object.keys(erreurs).length > 0) {
    return { success: false, error: Object.values(erreurs)[0]! };
  }

  const adminClient = createAdminClient();
  const { data, error } = await adminClient.auth.admin.createUser({
    email: email.trim(),
    password: motDePasse,
    email_confirm: true,
  });

  if (error || !data.user) {
    return { success: false, error: error?.message ?? "Erreur lors de la création du compte." };
  }

  // Attribution du rôle 'employe' via la fonction RPC dédiée (check des droits côté DB)
  const supabase = await createClient();
  const { error: erreurRole } = await supabase.rpc("admin_activer_role_employe", {
    p_user_id: data.user.id,
  });

  if (erreurRole) {
    return { success: false, error: `Compte créé mais rôle non appliqué : ${erreurRole.message}` };
  }

  revalidatePath("/admin/employes");
  return { success: true };
}

// Activer ou désactiver un compte employé (ex: en cas de départ)
export async function definirStatutCompteEmploye(
  employeId: string,
  actif: boolean,
): Promise<AdminActionResult> {
  const profil = await getCurrentProfile();
  if (!profil || profil.role !== "administrateur") {
    return { success: false, error: "Action réservée aux administrateurs." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_definir_statut_compte_employe", {
    p_user_id: employeId,
    p_actif: actif,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/employes");
  return { success: true };
}
