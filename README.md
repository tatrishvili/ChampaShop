# ChampaShop

Boutique en ligne fictive — projet fil rouge Nuxt 4 / Vue 3 / TypeScript.
API produits & auth : [DummyJSON](https://dummyjson.com).

## Stack

- Nuxt 4.5 (Vue 3, `<script setup>`, SSR, structure `app/`)
- TypeScript strict (`typescript.strict` + `typescript.typeCheck` dans `nuxt.config.ts`)
- Pinia (`@pinia/nuxt`) — state management, panier
- Vitest + `@vitest/coverage-v8` — couverture ≥ 90 % (lignes + branches) imposée sur `app/utils/promotions.ts`
- ESLint (`@nuxt/eslint`) + Prettier
- `@nuxt/test-utils` pour les tests en environnement Nuxt

## Structure du projet

```
app/
  app.vue
  pages/
  components/
  composables/
  layouts/
  middleware/
  utils/          <- logique métier pure (promotions.ts, etc.)
  types/
server/            <- API routes / server middleware
public/
test/
  unit/            <- tests Vitest en environnement Node (ex. promotions.spec.ts)
  nuxt/            <- tests Vitest en environnement Nuxt (composants, composables)
docs/
  ai-usage/        <- un fichier <prenom>.md par étudiant
nuxt.config.ts
vitest.config.ts
```

## Installation

Prérequis : Node.js 20+, npm, un accès en tant que collaborateur au dépôt.

```bash
git clone https://github.com/tatrishvili/ChampaShop.git
cd ChampaShop
npm install
```

Au premier `npm install`, deux paquets (`esbuild`, `unrs-resolver`) demandent l'autorisation d'exécuter un script d'installation (téléchargement de binaires natifs, comportement normal de Vite/Nuxt) :

```bash
npm install-scripts approve esbuild
npm install-scripts approve unrs-resolver
```

Lancer le serveur de dev :

```bash
npm run dev
```

Le site tourne sur http://localhost:3000.

## Branches de travail

Ne travaillez jamais directement sur `main`. Après le clone :

```bash
git checkout develop
git pull
git checkout -b feature/<numéro-issue>-<description>
```

## Scripts

| Commande               | Effet                                                        |
|-------------------------|----------------------------------------------------------------|
| `npm run dev`           | Serveur de développement                                       |
| `npm run build`         | Build de production                                             |
| `npm run lint`          | ESLint sur tout le projet                                       |
| `npm run typecheck`     | Vérification TypeScript stricte (`nuxi typecheck`)               |
| `npm run test`          | Tests unitaires Vitest (exécution unique, pas de watch)          |
| `npm run test:watch`    | Tests Vitest en mode watch (dev local uniquement)                 |
| `npm run test:coverage` | Tests + rapport de couverture (seuil 90 % lignes/branches imposé) |
| `npm run test:unit`     | Uniquement le projet Vitest "unit" (environnement Node)          |
| `npm run test:nuxt`     | Uniquement le projet Vitest "nuxt" (environnement Nuxt/happy-dom) |

`lint`, `typecheck`, `test`, `build` tournent automatiquement sur chaque Pull Request via GitHub Actions (`.github/workflows/ci.yml`).

## Conventions Git — GitFlow

| Branche             | Créée depuis | Mergée dans      | Règle                                                                 |
|----------------------|--------------|-------------------|------------------------------------------------------------------------|
| `main`               | —            | —                 | Production. Protégée, merge uniquement depuis `release/*` ou `hotfix/*` |
| `develop`            | `main`       | —                 | Intégration. Merge uniquement par PR approuvée                        |
| `feature/<n°>-<desc>`| `develop`    | `develop`         | Une issue = une branche = une PR                                       |
| `release/vX.Y.Z`     | `develop`    | `main` + `develop`| Gel des fonctionnalités, corrections uniquement                        |
| `hotfix/<desc>`      | `main`       | `main` + `develop`| Correction urgente en production                                       |

### Workflow

1. Chaque fonctionnalité = une issue GitHub assignée, avec critères d'acceptation.
2. Créer la branche `feature/` depuis `develop` à jour.
3. Commits au format [Conventional Commits](https://www.conventionalcommits.org/) : `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`.
4. Ouvrir la PR vers `develop`, référencer l'issue (`Closes #14`), remplir le template.
5. Au moins une review approuvée avant merge.
6. Merge en `--no-ff` ("Create a merge commit"). Supprimer la branche après merge.
7. Fin de semaine : branche `release/vX.Y.Z` → merge dans `main` et `develop` → tag + GitHub Release.

## Répartition des rôles

| Membre     | Rôle / zones principales        |
|------------|----------------------------------|
| _à remplir_ | Catalogue (F1), SEO fiche produit |
| _à remplir_ | Panier & promotions (F3, F4)      |
| _à remplir_ | Authentification (F5), CI/CD      |

## Stratégie filtre prix min/max

DummyJSON ne propose pas de filtre prix côté API. Stratégie retenue : _à documenter ici_ (ex. : récupération de la catégorie/recherche filtrée côté serveur, puis filtrage prix côté client sur la page courante, avec impact discuté sur pagination et performance).

## Usage de l'IA

Chaque membre tient à jour son fichier `docs/ai-usage/<prenom>.md`. Case à cocher obligatoire dans chaque PR si une partie significative du code a été générée par IA.

## Déploiement

Site déployé automatiquement depuis `main` sur [Vercel/Netlify — à préciser].
Lien : _à ajouter une fois déployé_.