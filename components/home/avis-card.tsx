import { Card, CardContent } from "@/components/ui/card";
import type { AvisPublic } from "@/lib/supabase/queries";

function StarRating({ note }: { note: number }) {
  return (
    <div
      role="img"
      aria-label={`Note : ${note} sur 5 etoiles`}
      className="flex gap-0.5 text-accent"
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <span key={index} aria-hidden="true">
          {index < note ? "\u2605" : "\u2606"}
        </span>
      ))}
    </div>
  );
}

export function AvisCard({ avis }: { avis: AvisPublic }) {
  const nomComplet = avis.auteur_initiale_nom
    ? `${avis.auteur_prenom} ${avis.auteur_initiale_nom}.`
    : avis.auteur_prenom;

  return (
    <Card className="h-full shadow-card">
      <CardContent className="flex h-full flex-col gap-3 p-6">
        <StarRating note={avis.note} />
        <blockquote className="flex-1 text-sm text-foreground">
          &laquo; {avis.commentaire} &raquo;
        </blockquote>
        <p className="text-sm font-medium text-muted-foreground">
          &mdash; {nomComplet}
        </p>
      </CardContent>
    </Card>
  );
}
