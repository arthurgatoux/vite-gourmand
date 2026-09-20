import { createClient } from "@/lib/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";

  if (token_hash && type) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!error) {
      // Token valide : redirection vers la destination prévue (ou la racine par défaut)
      redirect(next);
    } else {
      // Erreur lors de la vérification du token OTP
      redirect(`/auth/error?error=${error?.message}`);
    }
  }

  // Requête incomplète (paramètres manquants dans la query)
  redirect(`/auth/error?error=No token hash or type`);
}
