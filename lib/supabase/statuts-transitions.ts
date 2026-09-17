import type { StatutCommande } from "./statuts-commande"

export const ORDRE_STATUTS: StatutCommande[] = [
  "en_attente",
  "accepte",
  "en_preparation",
  "en_livraison",
  "livre",
  "attente_retour_materiel",
  "termine",
]

export function getProchainsStatuts(statutActuel: StatutCommande): StatutCommande[] {
  const index = ORDRE_STATUTS.indexOf(statutActuel)
  const suivants: StatutCommande[] = []

  if (index >= 0 && index < ORDRE_STATUTS.length - 1) {
    suivants.push(ORDRE_STATUTS[index + 1])
  }

  if (statutActuel !== "termine" && statutActuel !== "annule") {
    suivants.push("annule")
  }

  return suivants
}
