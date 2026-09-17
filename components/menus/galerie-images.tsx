"use client";

import { useState } from "react";

interface GalerieImagesProps {
  images: string[];
  titre: string;
}

/**
 * Galerie interactive de la vue detaillee d'un menu.
 * La premiere image (images[0]) est l'image mise en avant, affichee par defaut.
 * Les miniatures en dessous sont cliquables (et activables au clavier via de vrais
 * <button>) pour afficher l'image correspondante en grand.
 */
export function GalerieImages({ images, titre }: GalerieImagesProps) {
  const [indexActif, setIndexActif] = useState(0);

  if (images.length === 0) {
    return (
      <div
        className="aspect-[4/3] w-full rounded-3xl bg-gradient-to-br from-primary to-accent"
        role="img"
        aria-label={`Aucune photo disponible pour le menu ${titre}`}
      />
    );
  }

  const indexAffiche = Math.min(indexActif, images.length - 1);

  return (
    <div className="flex flex-col gap-4">
      <div className="aspect-[4/3] w-full overflow-hidden rounded-3xl bg-secondary">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[indexAffiche]}
          alt={
            indexAffiche === 0
              ? `Photo principale du menu ${titre}`
              : `Photo ${indexAffiche + 1} du menu ${titre}`
          }
          className="h-full w-full object-cover"
        />
      </div>

      {images.length > 1 && (
        <ul className="flex flex-wrap gap-3">
          {images.map((url, index) => (
            <li key={url} className="h-20 w-20 flex-shrink-0">
              <button
                type="button"
                onClick={() => setIndexActif(index)}
                aria-label={`Afficher la photo ${index + 1} du menu ${titre} en grand`}
                aria-pressed={index === indexAffiche}
                className={`h-full w-full overflow-hidden rounded-xl border-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  index === indexAffiche ? "border-primary" : "border-border"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-full w-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
