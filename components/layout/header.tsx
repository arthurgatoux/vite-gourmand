import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { LogoutButton } from "@/components/logout-button";
import { getCurrentProfile } from "@/lib/supabase/get-current-profile";

const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/menus", label: "Nos menus" },
  { href: "/contact", label: "Contact" },
];

function espaceLink(role: "utilisateur" | "employe" | "administrateur") {
  if (role === "administrateur") return { href: "/admin", label: "Espace administrateur" };
  if (role === "employe") return { href: "/employe", label: "Espace employe" };
  return { href: "/compte", label: "Mon espace" };
}

export async function Header() {
  const profil = await getCurrentProfile();

  return (
    <header className="w-full border-b border-border bg-background">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
        <Link
          href="/"
          className="font-heading text-lg text-primary focus-visible:outline-none focus-visible:ring focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm"
        >
          Vite &amp; Gourmand
        </Link>

        <nav aria-label="Navigation principale">
          <ul className="flex items-center gap-6 text-sm font-medium">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-foreground hover:text-primary focus-visible:outline-none focus-visible:ring focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          {profil ? (
            <>
              <Button asChild size="sm" variant="outline">
                <Link href={espaceLink(profil.role).href}>
                  {espaceLink(profil.role).label}
                </Link>
              </Button>
              <LogoutButton />
            </>
          ) : (
            <>
              <Button asChild size="sm" variant="outline">
                <Link href="/auth/login">Connexion</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/auth/sign-up">Creer un compte</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
