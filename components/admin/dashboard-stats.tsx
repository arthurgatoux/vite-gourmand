"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import type { StatMenu } from "@/lib/mongodb/stats-menus-queries";

interface DashboardStatsProps {
  stats: StatMenu[];
}

/**
 * CDC page 9 : comparatif du nombre de commandes par menu (graphique) et
 * calcul du chiffre d'affaires filtrable par menu et par duree.
 *
 * Le jeu de donnees est un document agrege par menu (pas d'evenements bruts,
 * cf. docs/NoSQL-MongoDB-ViteGourmand.md section 1) : il tient entierement
 * en memoire cote client, donc les deux filtres sont calcules localement,
 * sans aller-retour serveur supplementaire.
 */
export function DashboardStats({ stats }: DashboardStatsProps) {
  const [menuFiltre, setMenuFiltre] = useState<string>("tous");
  const [moisDebut, setMoisDebut] = useState("");
  const [moisFin, setMoisFin] = useState("");

  const maxCommandes = Math.max(...stats.map((s) => s.nbCommandesTotal), 1);

  const statsFiltrees = useMemo(
    () => (menuFiltre === "tous" ? stats : stats.filter((s) => s.menuId === menuFiltre)),
    [stats, menuFiltre],
  );

  const { caPeriode, nbCommandesPeriode } = useMemo(() => {
    let ca = 0;
    let nb = 0;
    for (const stat of statsFiltrees) {
      for (const mois of stat.historiqueMensuel) {
        if (moisDebut && mois.mois < moisDebut) continue;
        if (moisFin && mois.mois > moisFin) continue;
        ca += mois.chiffreAffaires;
        nb += mois.nbCommandes;
      }
    }
    return { caPeriode: ca, nbCommandesPeriode: nb };
  }, [statsFiltrees, moisDebut, moisFin]);

  if (stats.length === 0) {
    return <p className="text-sm text-muted-foreground">Aucune donnée statistique pour le moment.</p>;
  }

  return (
    <div className="flex flex-col gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Commandes par menu</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {stats.map((stat) => (
            <div key={stat.menuId} className="flex flex-col gap-1">
              <div className="flex items-baseline justify-between text-sm">
                <span className="font-medium">{stat.titreMenu}</span>
                <span className="text-muted-foreground">{stat.nbCommandesTotal} commande(s)</span>
              </div>
              <div className="h-3 w-full rounded-full bg-secondary" role="img" aria-label={`${stat.titreMenu} : ${stat.nbCommandesTotal} commandes sur ${maxCommandes} maximum`}>
                <div
                  className="h-3 rounded-full bg-primary"
                  style={{ width: `${(stat.nbCommandesTotal / maxCommandes) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Chiffre d&apos;affaires</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="filtre-menu">Menu</Label>
              <select
                id="filtre-menu"
                value={menuFiltre}
                onChange={(e) => setMenuFiltre(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="tous">Tous les menus</option>
                {stats.map((stat) => (
                  <option key={stat.menuId} value={stat.menuId}>
                    {stat.titreMenu}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="mois-debut">Depuis</Label>
              <input
                id="mois-debut"
                type="month"
                value={moisDebut}
                onChange={(e) => setMoisDebut(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="mois-fin">Jusqu&apos;à</Label>
              <input
                id="mois-fin"
                type="month"
                value={moisFin}
                onChange={(e) => setMoisFin(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          </div>
          <div className="grid gap-4 rounded-xl border-2 border-accent bg-secondary p-6 sm:grid-cols-2" aria-live="polite">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Chiffre d&apos;affaires</p>
              <p className="mt-1 font-heading text-3xl text-primary">{caPeriode.toFixed(2)} EUR</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Commandes</p>
              <p className="mt-1 font-heading text-3xl">{nbCommandesPeriode}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
