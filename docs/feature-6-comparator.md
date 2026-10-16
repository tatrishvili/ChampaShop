# Récapitulatif — `feature/6-compare`

Comparateur de produits de ChampaShop (Nuxt 4 + API [dummyjson.com](https://dummyjson.com)).
Document rédigé le 2026-10-16. Il retrace les étapes, le pourquoi de chaque choix, et ce qui a été ajouté/modifié/corrigé.

La sélection du comparateur est **doublement persistée et toujours rendue côté serveur** :

- un **cookie** `compare` (ids seuls) suit l'utilisateur sur tout le site et alimente la barre de comparaison ;
- l'**URL** `/comparer?ids=3,17,42` est la **source de vérité** de la page de comparaison, ce qui rend chaque comparaison partageable et reproductible à l'identique (SSR, bouton Retour, rechargement).

Deux règles clés de la consigne :

1. **Maximum 3 produits.** Au 4ᵉ, rien n'est ajouté et un message est annoncé aux lecteurs d'écran (`aria-live`) : « Comparateur plein : retirez un produit pour en ajouter un autre ».
2. **Lien partageable identique en SSR**, robuste aux URL malformées (jamais de 500).

---

## Étape 1 — Modèle de sélection pur (`app/utils/compare.ts`)

**Objectif :** une seule **frontière de confiance** pour tout ce qui entre dans le comparateur, qu'il vienne du cookie (que l'utilisateur peut éditer) ou de l'URL (lien forgé).

**Fait :**
- `parseCompareIds(raw, max)` accepte un `number[]`, une chaîne JSON (`"[3,17]"`) ou une chaîne CSV (`"3,17,42"`, format de l'URL), et renvoie **au plus 3 entiers strictement positifs, uniques** (première occurrence gardée, ordre préservé). Tout le reste (`null`, JSON cassé, objets, négatifs, non-numériques) → `[]`. **Ne lève jamais d'exception.**
- `compareIdsToParam(ids)` : forme canonique `3,17,42` (format URL).
- `compareSelectionsEqual(a, b)` : égalité insensible à l'ordre (sert à détecter cookie ≠ URL).
- Constante `MAX_COMPARE = 3`.

**Pourquoi :** centraliser la validation évite de disperser des gardes fragiles dans le store, la barre et la page ; une fonction pure est facile à tester exhaustivement.

**Tests :** `tests/unit/compare.spec.ts` (13 cas : ordre, CSV, JSON, dédoublonnage, plafond, entrées invalides, max personnalisé).

---

## Étape 2 — Store Pinia (`app/stores/compare.ts`)

**Objectif :** l'état partagé du comparateur, persisté et cohérent SSR/client.

**Fait :**
- Cookie `compare` via `useCookie` (`number[]`, `maxAge` 30 j, `sameSite: lax`) — ids seuls, donc la sélection est présente **dès le premier octet serveur** (pas de flash d'hydratation). Calqué sur le store `recently-viewed`.
- **Auto-réparation :** si le cookie brut diffère de sa forme normalisée (cookie trafiqué/obsolète), il est réécrit une fois à l'init.
- Actions : `add`, `remove`, `toggle`, `replace` (adopter une sélection), `clear`. Getters : `count`, `isFull`, `isEmpty`, `has(id)`.
- **Limite de 3 :** `add` ignore un ajout quand `isFull` et déclenche l'annonce.
- `announcement` (ref) : message de la région `aria-live`, porté par le store car le **déclencheur** (un bouton de carte) et l'**annonceur** (la barre) sont des composants différents.

**Pourquoi un store pour le message :** la région vivante vit dans la barre, mais c'est un bouton ailleurs dans la page qui provoque l'annonce ; le store est le point de rendez-vous.

---

## Étape 3 — Résolution des produits (`app/composables/useCompareProducts.ts`)

**Objectif :** transformer une liste d'ids en produits, tolérante aux échecs.

**Fait :**
- DummyJSON n'a pas d'endpoint « plusieurs produits par ids » → un `$fetch` par id **en parallèle** via `Promise.allSettled`.
- Un id en échec (404, réseau) est **simplement ignoré** : les autres s'affichent quand même ; l'ordre d'entrée est conservé.
- Clé `useAsyncData` **réactive** (fonction des ids + de la projection) → SSR et client hydratent la même clé, et changer la sélection relance le fetch.
- Option `select` pour alléger la charge utile (la barre ne demande que `id,title,thumbnail` ; le tableau fetch le produit complet).

**Pourquoi :** même stratégie que `recently-viewed` ; la tolérance aux échecs évite qu'un produit supprimé casse toute la comparaison.

---

## Étape 4 — Bouton bascule (`app/components/compare/CompareButton.vue`)

**Objectif :** ajouter/retirer un produit, avec un état accessible, sur les cartes (`icon`) et la fiche produit (`full`).

**Fait :**
- `<button>` avec `aria-pressed` (l'état porté par `aria-pressed`, nom accessible stable « Comparer *titre* »).
- Deux variantes : `icon` (overlay compact sur la carte, texte en `sr-only`) et `full` (bouton pleine largeur sur la fiche).
- Dans `ProductCard.vue`, le bouton est **hors** du `<a>` du lien (un `<button>` ne peut pas vivre dans un `<a>` : HTML invalide + navigation parasite). La carte a donc été restructurée : racine `<div>`, lien interne `product-card__link`, bouton en overlay `position: absolute`.

**Pourquoi `aria-pressed` et pas deux boutons :** un seul bouton bascule, dont l'état est annoncé, est le motif ARIA recommandé pour un toggle.

---

## Étape 5 — Barre de comparaison (`app/components/compare/CompareBar.vue`)

**Objectif :** un rappel persistant de la sélection, présent sur tout le site.

**Fait :**
- Barre fixée en bas, `role="region"`, titre « Comparer (n/3) », vignettes + titres (projection légère), retrait par produit, « Tout retirer », et CTA vers `/comparer?ids=`.
- **Masquée** sur `/comparer` (redondante avec la page).
- Région vivante `role="status" aria-live="polite"` **toujours montée** quand la barre est visible (un lecteur d'écran n'annonce de façon fiable que le **changement de texte d'un nœud déjà présent**, pas l'apparition d'un nœud).

**Pourquoi SSR :** la barre se rend déjà remplie au rechargement (cookie lu côté serveur), donc pas de clignotement « vide → rempli ».

---

## Étape 6 — Page de comparaison (`app/pages/comparer.vue`)

**Objectif :** comparer jusqu'à 3 produits côte à côte, à partir d'un lien partageable.

**Fait :**
- **URL = source de vérité.** `?ids=` est parsé par `parseCompareIds`.
- **Normalisation par redirection `replace`** (SSR + client) : une URL invalide/dupliquée/>3/mal ordonnée est réécrite vers sa forme canonique (ex. `?ids=3,3,17` → `?ids=3,17`), donc **jamais de 500** et la barre d'adresse reflète toujours la vraie sélection. Idempotent (pas de boucle).
- **Bannière d'adoption :** si la sélection du lien diffère du cookie du visiteur, un encart « Remplacer ma sélection par celle-ci » propose de l'adopter (sans l'imposer).
- **Tableau accessible :** `<caption>`, `th scope="col"` (produits), `th scope="row"` (caractéristiques).
- **Meilleure valeur par ligne** : mise en évidence du meilleur Prix (min), de la meilleure Note (max) et du meilleur Stock (max), avec libellé texte (« Meilleur prix »…) — seulement à ≥ 2 produits et quand il y a un vrai gagnant.
- **« Afficher uniquement les différences »** : masque les lignes identiques pour tous.
- **1ʳᵉ colonne figée** (sticky) + scroll horizontal : rend le tableau utilisable en mobile.
- **États** : chargement, erreur dure (bouton Réessayer), vide (aucun id), indisponible (ids présents mais aucun chargé), et **avertissement d'échec partiel**.
- **« Copier le lien »** : API Presse-papiers, avec **repli** (champ lecture seule à copier à la main) si indisponible.

---

## Étape 7 — La règle des « 3 maximum » et son correctif

**Consigne :** au 4ᵉ produit, rien n'est ajouté **et** un message `aria-live` « Comparateur plein : retirez un produit pour en ajouter un autre » est annoncé.

**Problème initial :** le bouton d'une carte non sélectionnée était **désactivé** (`disabled`) quand le comparateur était plein → un bouton désactivé n'émet pas de clic, donc l'annonce (pourtant écrite) **ne pouvait jamais partir** (code mort).

**Correctif en deux temps :**

1. Le bouton plein-et-non-sélectionné **reste cliquable** (jamais `disabled`). Le clic appelle `add()`, qui n'ajoute rien et déclenche l'annonce via `announceFull()` — lequel **vide puis re-remplit** `announcement` sur le `nextTick` pour que la région `aria-live` ré-annonce à **chaque** tentative (un lecteur d'écran ignore un texte inchangé).
2. **Retour visible pour tous :** le message n'était qu'en `sr-only` (invisible à la souris), ce qui faisait croire que le bouton était mort. Ajout d'un **bandeau visible** dans la barre (`compare-bar__alert`, `aria-hidden` car la région vivante couvre déjà les lecteurs d'écran) + suppression du look « désactivé » du bouton (plus d'opacité réduite ni de `cursor: not-allowed`, survol rétabli ; seul indice restant : **bordure tiretée** + info-bulle). Le bandeau s'**auto-ferme** après 6 s (minuteur client, par instance) et disparaît dès qu'un créneau se libère.

**Pourquoi :** respecter la consigne (rien ajouté + annonce) **tout en** rendant le comportement perceptible et non frustrant, aussi bien au lecteur d'écran qu'à la souris.

---

## Accessibilité (récapitulatif)

- Boutons `aria-pressed` (état annoncé).
- Région `aria-live="polite"` toujours montée pour l'annonce « plein », doublée d'un bandeau visible.
- Tableau sémantique : `<caption>`, en-têtes `scope="col"`/`scope="row"`.
- 1ʳᵉ colonne figée pour la lecture au scroll mobile.
- Statuts de copie en `role="status" aria-live="polite"`.

---

## Fichiers

**Nouveaux**
- `app/utils/compare.ts` — modèle de sélection pur (frontière de confiance).
- `app/stores/compare.ts` — store Pinia (cookie, limite 3, annonce).
- `app/composables/useCompareProducts.ts` — résolution ids → produits, tolérante aux échecs.
- `app/components/compare/CompareButton.vue` — bouton bascule (variantes `icon`/`full`).
- `app/components/compare/CompareBar.vue` — barre persistante + région vivante + bandeau visible.
- `app/pages/comparer.vue` — page de comparaison pilotée par l'URL.
- `tests/unit/compare.spec.ts` — tests du modèle pur (13 cas).
- `tests/unit/compare-store.spec.ts` — tests du store (limite 3 + annonce, 4 cas).

**Modifiés**
- `app/components/ProductCard.vue` — restructuration (bouton comparer en overlay hors du lien).
- `app/pages/products/[id].vue` — bouton « Comparer » pleine largeur sous l'ajout panier.
- `app/app.vue` — `<CompareBar/>` global.

---

## Vérifications

**Automatiques**
- `npm run lint` → 0 erreur (seul le warning préexistant `<img/>` de `ProductCard`).
- `npm run typecheck` → OK.
- `npm run test` → **50 tests** au vert.

**SSR (curl)**
- `/products` (cookie 3 ids) : **0 bouton « Comparer » désactivé**, 3 `aria-pressed="true"`, barre « Comparer (3/3) », région `aria-live` présente.
- `/comparer?ids=3,17,42` : tableau en SSR, `<caption>`, 3 `scope="col"`, `scope="row"`, « Meilleur prix/Meilleure note/Meilleur stock », barre masquée.
- Robustesse (tous **302**, aucun 500) : `3,3,17→3,17`, `1,2,3,4,5→1,2,3`, `3,17,3→3,17`, `abc`/`-1,0`/`[}`→`/comparer`.
- `/comparer` sans ids → état vide ; `?ids=3,999999` → 1 produit + avertissement d'échec partiel ; cookie ≠ URL → bannière d'adoption.

**Manuel (navigateur / lecteur d'écran)**
- 4ᵉ clic : rien ajouté + bandeau visible « Comparateur plein… » ; bouton bien cliquable.
- F5 conserve la sélection sans flash ; lien partagé reproduit la comparaison en navigation privée.
- Lecteur d'écran : annonce « plein » et états `aria-pressed`.
- Mobile ~375 px : scroll horizontal, 1ʳᵉ colonne figée, pas de débordement.
