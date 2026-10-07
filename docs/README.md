# Stratégies techniques — ChampaShop

Ce README (distinct du README racine, orienté installation) documente les
**décisions de conception** du catalogue, et en particulier les filtres que
l'API [DummyJSON](https://dummyjson.com) **ne sait pas faire** côté serveur.

## Filtre prix min/max

### Le problème

DummyJSON ne propose **aucun paramètre de prix** : ni `minPrice`/`maxPrice`,
ni intervalle sur `/products`, `/products/category/{slug}` ou
`/products/search`. On ne peut donc pas déléguer le filtrage au serveur comme on
le fait pour le tri (`sortBy`/`order`, lui supporté nativement).

C'est exactement la situation déjà rencontrée pour la **recherche par titre** :
l'endpoint `/search` matche aussi la description et les tags. La stratégie
retenue y est donc **réutilisée et généralisée**, pour ne pas avoir deux
mécaniques divergentes dans le code.

### La stratégie : « fetch-all → filtrer → paginer côté client »

Quand un filtre prix (`minPrice` et/ou `maxPrice`) **ou** une recherche titre est
actif, `useProducts` bascule sur un chemin unique :

1. **Un seul appel large** à l'endpoint le plus restrictif encore disponible
   côté serveur (`/search?q=` si recherche, sinon
   `/products/category/{slug}` si catégorie, sinon `/products`), avec
   `limit=0` → le serveur renvoie **tout** le sous-ensemble concerné, déjà trié.
2. **Filtrage côté client** : titre (sous-chaîne, insensible à la casse) puis
   prix (`price >= minPrice` et `price <= maxPrice`, bornes optionnelles).
3. **Pagination côté client** : `slice((page-1)*12, +12)`, et `total` recalculé
   sur le nombre de résultats filtrés pour que le composant de pagination
   affiche le bon nombre de pages.

Sans filtre prix ni recherche, on **garde la pagination serveur** classique
(`limit=12` + `skip`), plus économe.

### Justification

**Appels réseau.**
- Le filtre prix n'ajoute **aucun appel** : il réutilise l'appel large déjà
  déclenché par la recherche, et se compose avec lui (on peut filtrer titre +
  prix en même temps). Hors recherche, il provoque **un seul** appel `limit=0`
  au lieu de l'appel paginé.
- Les paramètres de prix vivent dans l'URL (`?minPrice=&maxPrice=`), donc l'état
  est partageable et re-jouable, et `useAsyncData` (clé `"products"`) mutualise /
  met en cache l'appel sur une même navigation.

**Performance.**
- Le catalogue DummyJSON est **petit** (≈ 194 produits ; une catégorie en compte
  quelques dizaines). Rapatrier l'ensemble en une fois représente une charge
  modeste, et le filtrage est un simple `Array.filter` en **O(n)** sur ce volume
  — imperceptible.
- Le filtre prix est **débouncé (300 ms)**, comme la recherche, donc taper un
  nombre ne déclenche pas une requête par frappe.
- Garde anti-course : `useAsyncData` applique le *last-call-wins*, une réponse
  ancienne ne peut jamais écraser une plus récente (frappe rapide).
- Limite assumée : la stratégie `limit=0` ne passerait pas à l'échelle sur un
  catalogue de milliers de produits. Elle est **volontairement adaptée à la
  taille réelle de l'API**. Sur une vraie API, le filtre prix serait poussé
  côté serveur (query params) et la pagination resterait serveur.

**Pagination.**
- Dès qu'un filtre client est actif, la pagination **doit** être côté client :
  paginer d'abord côté serveur puis filtrer donnerait des pages incomplètes
  (ex. 3 produits sur une page de 12) et un nombre de pages faux.
- `total` est donc **recalculé après filtrage** (`matches.length`), ce qui garde
  le composant `ProductPagination` juste sans le modifier.
- Changer un filtre prix **réinitialise la page** à 1 (via `useDebouncedQuery`),
  pour ne pas rester bloqué sur une page qui n'existe plus après filtrage.

### Composition avec les autres filtres

| Filtre      | Côté      | Se combine avec                          |
|-------------|-----------|------------------------------------------|
| Catégorie   | serveur   | tri, **prix** (exclusif avec recherche)  |
| Recherche   | client    | tri, **prix** (exclusif avec catégorie)  |
| Tri         | serveur   | tout                                     |
| **Prix**    | **client**| tri, catégorie **ou** recherche          |

Le prix est **orthogonal** : il ne vide ni la catégorie, ni la recherche, ni le
tri (`clearKeys` vide pour ses deux champs) ; il ne réinitialise que la page.

### Fichiers concernés

- `app/composables/useProducts.ts` — chemin unifié fetch-all/filtrage/pagination.
- `app/components/ProductPriceFilter.vue` — deux champs numériques débouncés.
- `app/pages/products/index.vue` — intègre le composant.
- `app/composables/useDebouncedQuery.ts` — réutilisé tel quel (aucune modif).
