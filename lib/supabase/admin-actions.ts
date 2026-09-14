"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "./server";
import { createAdminClient } from "./admin";
import { getCurrentProfile } from "./get-current-profile";
import { validerCreationEmploye } from "../validations/admin";

export type AdminActionResult = { success: true } | { success: false; error: string };

/**
 * CDC page 9 : "il peut creer un compte de type employe, il doit pour cela,
 * fournir un email qui sera l'username ainsi qu'un mot de passe. L'employe
 * en question va recevoir un mail lui notifiant qu'un compte, pour lui, a
 * ete cree, cependant, le mot de passe n'est pas communique dans le mail."
 *
 * Le mail de bienvenue existant (migration 004, trigger sur public.profils)
 * se declenche automatiquement des la creation du profil et ne contient
 * jamais le mot de passe : il est reutilise tel quel, sans nouveau trigger.
 */
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

  // Le trigger handle_new_user cree le profil avec le role "utilisateur" par
  // defaut (RG1). On le fait passer a "employe" via la fonction RPC dediee,
  // jamais par une mise a jour directe : la session utilisee ici est celle
  // de l'admin authentifie, verifiee a nouveau a l'interieur de la fonction.
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

/**
 * CDC page 9 : "il doit etre possible egalement de rendre inutilisable un
 * compte employe en cas de depart de l'entreprise par exemple."
 */
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
