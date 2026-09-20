import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasEnvVars } from "../utils";

// Routes publiques accessibles sans être connecté (accueil, catalogue, contact, legal, auth)
const PUBLIC_PATH_PREFIXES = [
  "/menus",
  "/contact",
  "/mentions-legales",
  "/cgv",
  "/auth",
  "/login",
];

function isPublicPath(pathname: string): boolean {
  if (pathname === "/") {
    return true;
  }
  return PUBLIC_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  if (!hasEnvVars) {
    return supabaseResponse;
  }

  // Création du client serveur Supabase pour rafraîchir les cookies de session
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Vérification de la session active
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  // Redirection vers le login si tentative d'accès à une route protégée sans être authentifié
  if (!isPublicPath(request.nextUrl.pathname) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
