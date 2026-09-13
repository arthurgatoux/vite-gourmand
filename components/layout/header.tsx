import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { LogoutButton } from "@/components/logout-button";
import { getCurrentProfile } from "@/lib/supabase/get-current-profile";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/menus", label: "Nos menus" },
  { href: "/contact", label: "Contact" },
];

function espaceLink(role: "utilisateur" | "employe" | "administrateur") {
  if (role === "administrateur") return { href: "/admin", label: "Espace administrateur" };
  if (role === "employe") return { href: "/employe", label: "Espace employe" };
  return { href: "/mon-compte", label: "Mon espace" };
}

export async function Header() {
  const profil = await getCurrentProfile();

  return (
    <header className="w-full bg-primary text-primary-foreground">
      <div className="mx-auto flex h-24 max-w-6xl items-center justify-between px-6 lg:px-11">
        <Link
          href="/"
          className="flex flex-col leading-tight focus-visible:outline-none focus-visible:ring focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-primary rounded-sm"
        >
          <span className="font-heading text-2xl">Vite &amp; Gourmand</span>
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">
            Traiteur bordelais
          </span>
        </Link>
        <nav aria-label="Navigation principale">
          <ul className="hidden items-center gap-8 text-base sm:flex">
            {NAV_LINKS.map((link, index) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    index === 0 ? "font-bold" : "font-medium",
                    "hover:text-accent focus-visible:outline-none focus-visible:ring focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-primary rounded-sm"
                  )}
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
              <Button asChild size="sm" variant="secondary">
                <Link href={espaceLink(profil.role).href}>{espaceLink(profil.role).label}</Link>
              </Button>
              <LogoutButton />
            </>
          ) : (
            <>
              <Button asChild size="sm" variant="secondary">
                <Link href="/auth/login">Connexion</Link>
              </Button>
              <Button
                asChild
                size="sm"
                variant="outline"
                className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Link href="/auth/sign-up">Creer un compte</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
