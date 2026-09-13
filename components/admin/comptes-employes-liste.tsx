"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { definirStatutCompteEmploye } from "@/lib/supabase/admin-actions";
import type { CompteEmploye } from "@/lib/supabase/admin-queries";

interface ComptesEmployesListeProps {
  comptes: CompteEmploye[];
}

export function ComptesEmployesListe({ comptes: comptesInitiaux }: ComptesEmployesListeProps) {
  const [comptes, setComptes] = useState(comptesInitiaux);
  const [erreur, setErreur] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleToggle(id: string, actif: boolean) {
    setErreur(null);
    startTransition(async () => {
      const resultat = await definirStatutCompteEmploye(id, actif);
      if (resultat.success) {
        setComptes((prev) => prev.map((c) => (c.id === id ? { ...c, compteActif: actif } : c)));
      } else {
        setErreur(resultat.error);
      }
    });
  }

  if (comptes.length === 0) {
    return <p className="text-sm text-muted-foreground">Aucun compte employe pour le moment.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {erreur && (
        <p className="text-sm text-destructive" role="alert">
          {erreur}
        </p>
      )}
      <ul className="grid gap-3">
        {comptes.map((c) => (
          <li
            key={c.id}
            className="flex items-center justify-between gap-4 rounded-xl border border-border bg-background p-4 shadow-card"
          >
            <div>
              <p className="font-medium">
                {c.prenom} {c.nom}
              </p>
              <p className="text-sm text-muted-foreground">{c.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={c.compteActif ? "default" : "outline"}>
                {c.compteActif ? "Actif" : "Desactive"}
              </Badge>
              <Button
                size="sm"
                variant={c.compteActif ? "outline" : "secondary"}
                disabled={isPending}
                onClick={() => handleToggle(c.id, !c.compteActif)}
              >
                {c.compteActif ? "Desactiver" : "Reactiver"}
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
