# ChampaShop

Boutique en ligne fictive — projet fil rouge Nuxt 4 / Vue 3 / TypeScript.
API produits & auth : [DummyJSON](https://dummyjson.com).

## Stack et versions exactes

- Node.js **24** (voir `.nvmrc`)
- Nuxt **4.5.2**
- Vue **3.5.43**
- Pinia (`@pinia/nuxt` **1.0.2**)
- Vitest **5.0.1** + `@vitest/coverage-v8`
- ESLint (`@nuxt/eslint` **1.17.0**) + Prettier
- `@nuxt/test-utils` **4.3.2**

Toutes les versions exactes sont figées dans `package-lock.json` — pas besoin de les retenir, `npm ci` s'en charge (voir ci-dessous).

## Installation — pour obtenir EXACTEMENT le même environnement

**1. Utiliser la bonne version de Node.**

Avec [nvm](https://github.com/nvm-sh/nvm) installé :
```bash
nvm use
```
Si Node 24 n'est pas installé sur ta machine :
```bash
nvm install
```
Ça lit automatiquement le fichier `.nvmrc` à la racine du projet.

**2. Cloner le dépôt.**
```bash
git clone https://github.com/tatrishvili/ChampaShop.git
cd ChampaShop
```

**3. Installer les dépendances avec `npm ci`, PAS `npm install`.**
```bash
npm ci
```

⚠️ **Pourquoi `npm ci` et pas `npm install`** : `npm install` peut installer des versions légèrement différentes de certains paquets si `package.json` autorise une plage de versions (ex. `^1.17.0`). `npm ci` installe exactement ce qui est écrit dans `package-lock.json`, au numéro de version près — c'est ce qui garantit que toute l'équipe tourne sur un environnement identique. `npm ci` supprime aussi `node_modules` avant de réinstaller, donc utilise-le aussi quand tu changes de branche et que quelque chose casse bizarrement.

**4. Approuver les scripts d'installation natifs (une seule fois).**

Deux paquets (`esbuild`, `unrs-resolver`, utilisés en interne par Vite/Nuxt) demandent l'autorisation d'exécuter un script d'installation — c'est normal et attendu :
```bash
npm install-scripts approve esbuild
npm install-scripts approve unrs-resolver
```

**5. Lancer le serveur de dev.**
```bash
npm run dev
```
Le site tourne sur http://localhost:3000.

## Si jamais nos environnements divergent

Si un jour ton `npm run dev` ou `npm run build` se comporte différemment du mien alors qu'on a le même code, c'est presque toujours un des trucs suivants :

- Quelqu'un a fait `npm install` au lieu de `npm ci` et a laissé les nouvelles versions dans `package-lock.json` → vérifier `git diff package-lock.json` avant de committer, ne jamais committer un `package-lock.json` modifié sans avoir explicitement voulu changer une dépendance.
- Une version de Node différente → refaire `nvm use` et vérifier avec `node -v` que ça affiche bien `v24.x.x`.
- `node_modules` corrompu ou partiellement installé (cache npm défaillant, installation interrompue) → `npm cache clean --force`, puis `rm -rf node_modules package-lock.json`, `git checkout package-lock.json`, et enfin `npm ci`.

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
tests/
  unit/            <- tests Vitest en environnement Node (ex. promotions.spec.ts)
  nuxt/            <- tests Vitest en environnement Nuxt (composants, composables)
docs/
  ai-usage/        <- un fichier <prenom>.md par étudiant
nuxt.config.ts
vitest.config.ts
```

## Branches de travail

Ne jamais travailler directement sur `main` ou `develop`. Après le clone :
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
| Ana | Fiche produit (F2), Panier & promotions (F3, F4) |
| Teammate | Catalogue (F1), Authentification (F5), CI/CD |

## Stratégie filtre prix min/max

DummyJSON ne propose pas de filtre prix côté API. Stratégie retenue : _à documenter ici_.

## Usage de l'IA

Chaque membre tient à jour son fichier `docs/ai-usage/<prenom>.md`. Case à cocher obligatoire dans chaque PR si une partie significative du code a été générée par IA.

## Déploiement

Site déployé automatiquement depuis `main` sur [Vercel/Netlify — à préciser].
Lien : _à ajouter une fois déployé_.