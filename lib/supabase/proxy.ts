import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasEnvVars } from "../utils";

// Routes accessibles sans authentification, conformement au CDC :
// - "/" : page d'accueil (p.3)
// - "/menus" : vue globale et vue detaillee des menus, "disponible pour les
//   personnes non authentifiees comme authentifie" (CDC p.5)
// - "/contact" : formulaire de contact accessible depuis le menu applicatif (CDC p.9)
// - "/mentions-legales", "/cgv" : liens obligatoires en pied de page (CDC p.4)
// - "/auth", "/login" : pages de connexion / inscription elles-memes
// Toutes les autres routes (/commande, /mon-compte, /employe, /admin) restent
// protegees : un visiteur non authentifie y est redirige vers /auth/login,
// conformement au CDC p.6 ("redirection vers connexion" avant commande).
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

  // If the env vars are not set, skip proxy check. You can remove this once you setup the project.
  if (!hasEnvVars) {
    return supabaseResponse;
  }

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
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

  // Do not run code between createServerClient and
  // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: If you remove getClaims() and you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  if (!isPublicPath(request.nextUrl.pathname) && !user) {
    // no user, potentiellement rediriger vers la page de connexion
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}
