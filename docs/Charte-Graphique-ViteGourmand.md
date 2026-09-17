# Charte graphique : Vite & Gourmand

**Projet :** ECF TP Développeur Web et Web Mobile (Studi)
**Auteur :** Arthur Gatoux (FastDev)

## 1. Intention de marque

Vite & Gourmand est un traiteur événementiel bordelais avec 25 ans d'existence. L'identité visuelle doit transmettre trois valeurs : le savoir-faire artisanal, l'élégance d'une prestation événementielle haut de gamme, et la chaleur d'une entreprise familiale. La palette s'inspire du vin de Bordeaux (bordeaux profond) et de la gastronomie festive (or, crème), sans tomber dans un style trop froid ou trop corporate.

## 2. Palette de couleurs

Toutes les combinaisons ci-dessous ont été vérifiées par calcul de contraste WCAG, conformément à l'exigence RGAA du cahier des charges : rendre l'application accessible.

| Rôle | Nom | Hex | Usage |
|---|---|---|---|
| Couleur principale | Bordeaux 900 | `#6B1E2B` | Header, boutons primaires, liens actifs |
| Couleur principale claire | Bordeaux 700 | `#8C2A3B` | États hover des éléments bordeaux |
| Couleur d'accent | Or 500 | `#C99A3A` | Badges, mise en avant (prix, promotions), icônes |
| Couleur d'accent foncée | Or 600 | `#A87F2C` | Fond de bouton secondaire (texte foncé uniquement) |
| Fond principal | Crème 50 | `#FBF6EE` | Fond de page |
| Fond secondaire | Crème 100 | `#F3EAD8` | Cartes, sections alternées |
| Texte principal | Charbon 900 | `#241F1D` | Corps de texte, titres |
| Texte secondaire | Gris 600 | `#5A5652` | Légendes, métadonnées |
| Fond neutre | Blanc | `#FFFFFF` | Cartes de menu, formulaires |
| Statut succès | Vert validé | `#2F6B44` | Avis validé, commande livrée |
| Statut erreur | Rouge erreur | `#B3261E` | Erreurs de formulaire, annulation |

### Règles de contraste (validées AA, ratio minimum 4.5:1 pour le texte courant)

| Combinaison | Ratio | Conformité |
|---|---|---|
| Charbon 900 sur Crème 50 | 15.15:1 | Texte normal |
| Charbon 900 sur Blanc | 16.29:1 | Texte normal |
| Blanc sur Bordeaux 900 | 11.38:1 | Texte normal |
| Blanc sur Bordeaux 700 | 8.37:1 | Texte normal |
| Charbon 900 sur Or 500 | 6.34:1 | Texte normal |
| Gris 600 sur Crème 50 | 6.76:1 | Texte normal |
| Blanc sur Vert validé | 6.35:1 | Texte normal |
| Blanc sur Rouge erreur | 6.54:1 | Texte normal |

**Règle impérative** : le blanc sur Or 600 n'atteint que 3.66:1, insuffisant pour du texte courant (seuil 4.5:1). Sur fond doré, toujours utiliser le texte Charbon 900, jamais de texte blanc, sauf pour un très grand titre en gras (seuil 3:1 accepté).

## 3. Typographie

| Usage | Police | Poids | Justification |
|---|---|---|---|
| Titres (h1, h2) | Playfair Display (Google Fonts) | 600/700 | Serif élégante évoquant la gastronomie, sans excès décoratif nuisant à la lisibilité |
| Corps de texte, UI | Inter (Google Fonts) | 400/500 | Sans-serif très lisible à petite taille, excellent support des variantes d'accessibilité (chiffres tabulaires pour les prix) |

Tailles de base (mobile first, en rem) :

| Élément | Taille | Interligne |
|---|---|---|
| h1 | 2rem (2.5rem desktop) | 1.2 |
| h2 | 1.5rem (1.875rem desktop) | 1.25 |
| h3 | 1.25rem | 1.3 |
| Corps de texte | 1rem (16px) | 1.5 |
| Petit texte / légende | 0.875rem | 1.4 |

Taille minimale de 16px pour tout texte de formulaire, conformément aux bonnes pratiques RGAA (éviter le zoom automatique mobile et préserver la lisibilité).

## 4. Composants UI (tokens)

| Token | Valeur | Usage |
|---|---|---|
| Rayon de bordure (`radius`) | 0.5rem (cartes), 0.375rem (boutons/inputs) | Cohérence avec Tailwind CSS déjà en place dans le projet |
| Espacement de base | 0.25rem, multiples de 4px | Grille d'espacement Tailwind |
| Ombre carte | `0 1px 3px rgba(36,31,29,0.1)` | Cartes de menu, formulaires |
| Focus clavier | Contour 2px Or 500, offset 2px | Obligatoire RGAA sur tous les éléments interactifs (liens, boutons, champs) |

### États d'interaction obligatoires (RGAA)

- **Focus visible** : contour visible sur tous les éléments interactifs, jamais supprimé via `outline: none` sans remplacement.
- **Hover et focus distincts** : le focus clavier doit rester visible même sans survol souris.
- **Erreurs de formulaire** : texte rouge erreur associé au champ via `aria-describedby`, jamais la couleur seule pour signaler une erreur (ajouter une icône ou un texte).

## 5. Application aux quatre rôles

Aucune variation de palette entre les rôles (cohérence de marque), mais des repères visuels additionnels :

- **Visiteur / Utilisateur** : dominante Crème 50 et Bordeaux 900, ton chaleureux et commercial.
- **Employé** : bandeau supérieur Bordeaux 700 pour distinguer visuellement l'espace de gestion de l'espace public.
- **Administrateur** : bandeau supérieur Charbon 900 avec accents Or 500 (dashboard statistique), pour marquer le niveau d'accès le plus élevé.

## 6. Prochaine étape

Cette charte doit être appliquée dans Figma (styles de couleur et de texte partagés) avant le début du traçage des wireframes, afin que les 3 maquettes bureau et 3 maquettes mobile exigées par le cahier des charges soient directement cohérentes entre elles.
