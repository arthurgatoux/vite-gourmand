"use server";

import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";

const BUCKET = "menu-images";
const TAILLE_MAX_OCTETS = 3 * 1024 * 1024; // Limit à 3 Mo par image
const TYPES_AUTORISES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const SIGNATURES: Record<string, number[]> = {
  "image/jpeg": [0xff, 0xd8, 0xff],
  "image/png": [0x89, 0x50, 0x4e, 0x47],
  "image/webp": [0x52, 0x49, 0x46, 0x46], // En-tête RIFF
};

async function verifierRoleEmployeOuAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub as string | undefined;
  if (!userId) return { autorise: false as const, supabase };

  const { data: profil } = await supabase
    .from("profils")
    .select("role")
    .eq("id", userId)
    .single();

  const autorise = profil?.role === "employe" || profil?.role === "administrateur";
  return { autorise, supabase };
}

function signatureValide(bytes: Uint8Array, mime: string) {
  const signature = SIGNATURES[mime];
  if (!signature) return false;
  return signature.every((octet, index) => bytes[index] === octet);
}

// Upload d'image dans le bucket Supabase Storage (vérif rôle, taille, type binaire + nom UUID)
export async function uploaderImageMenu(
  formData: FormData
): Promise<{ success: true; url: string } | { success: false; error: string }> {
  const { autorise, supabase } = await verifierRoleEmployeOuAdmin();
  if (!autorise) {
    return { success: false, error: "Action reservee aux employes et administrateurs." };
  }

  const fichier = formData.get("fichier");
  if (!(fichier instanceof File) || fichier.size === 0) {
    return { success: false, error: "Aucun fichier recu." };
  }

  if (fichier.size > TAILLE_MAX_OCTETS) {
    return { success: false, error: "Image trop lourde (3 Mo maximum)." };
  }

  const extension = TYPES_AUTORISES[fichier.type];
  if (!extension) {
    return { success: false, error: "Format non supporte (JPEG, PNG ou WebP uniquement)." };
  }

  const octets = new Uint8Array(await fichier.arrayBuffer());
  if (!signatureValide(octets, fichier.type)) {
    return { success: false, error: "Le contenu du fichier ne correspond pas a une image valide." };
  }

  const chemin = `menus/${randomUUID()}.${extension}`;
  const { error: erreurUpload } = await supabase.storage
    .from(BUCKET)
    .upload(chemin, octets, { contentType: fichier.type, upsert: false });

  if (erreurUpload) {
    console.error("Erreur upload image menu :", erreurUpload.message);
    return { success: false, error: "Echec de l'envoi de l'image." };
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(chemin);
  return { success: true, url: data.publicUrl };
}

// Supprime un fichier du bucket Supabase Storage s'il en fait partie
export async function supprimerImageMenu(
  url: string
): Promise<{ success: true } | { success: false; error: string }> {
  const { autorise, supabase } = await verifierRoleEmployeOuAdmin();
  if (!autorise) {
    return { success: false, error: "Action reservee aux employes et administrateurs." };
  }

  const marqueur = `/storage/v1/object/public/${BUCKET}/`;
  const index = url.indexOf(marqueur);
  if (index === -1) {
    return { success: true };
  }

  const chemin = url.slice(index + marqueur.length);
  const { error } = await supabase.storage.from(BUCKET).remove([chemin]);
  if (error) {
    console.error("Erreur suppression image menu :", error.message);
    return { success: false, error: "Echec de la suppression de l'image." };
  }
  return { success: true };
}
