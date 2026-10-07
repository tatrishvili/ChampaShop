# Feature 5 — Authentification

Branche `feature/5-authentification`. Authentification basée sur l'API dummyjson
(`dummyjson.com/docs/auth`) : connexion, session persistée via cookies, chargement
du profil côté serveur (sans flash), protection de routes et rafraîchissement de
token en « single-flight ».

## Endpoints utilisés (vérifiés sur la doc officielle + en live)

| Besoin | Méthode | URL | Corps / en-têtes |
|---|---|---|---|
| Connexion | POST | `/auth/login` | `{ username, password, expiresInMins }` → user + `accessToken` + `refreshToken` |
| Profil courant | GET | `/auth/me` | en-tête `Authorization: Bearer <accessToken>` |
| Rafraîchir | POST | `/auth/refresh` | `{ refreshToken, expiresInMins }` → nouvelle paire de tokens |

Compte de démonstration : `emilys` / `emilyspass`. Les mauvais identifiants
renvoient `400` ; un token expiré renvoie `401` (un token malformé renvoie `500`).

## Fichiers

- `app/types/auth.ts` — `AuthUser`, `LoginResponse`, `RefreshResponse`.
- `app/stores/auth.ts` — store Pinia : tokens en cookies, `user` en state,
  actions `login` / `logout` / `refresh` / `fetchMe` / `init`, et l'instance
  authentifiée `apiFetch`.
- `app/plugins/auth-init.ts` — restaure la session au démarrage (SSR), pas de flash.
- `app/middleware/auth.ts` — garde de route pour les pages connecté-seulement.
- `app/pages/login.vue` — formulaire de connexion + redirection après succès.
- `app/pages/account.vue` — page protégée (`middleware: 'auth'`).
- `app/pages/index.vue` — accueil (destination du retour après déconnexion).
- `app/app.vue` — navigation conditionnelle (connecté / déconnecté).

## Choix de conception

1. **Tokens en cookies, pas de flash.** `accessToken` et `refreshToken` sont des
   `useCookie` : lisibles côté serveur et client, ils survivent au rechargement.
   Au démarrage, le plugin `auth-init` appelle `/auth/me` **pendant le SSR** à
   partir du cookie : la première peinture reflète déjà l'état connecté. L'état
   Pinia (`user`) étant sérialisé vers le client, la garde `!user` évite un second
   appel à l'hydratation.
2. **`httpOnly` désactivé — assumé.** Le client doit lire le token pour poser
   l'en-tête `Authorization: Bearer` (dummyjson authentifie par en-tête, pas par
   cookie côté API). `secure` est activé hors dev.
3. **Refresh « single-flight ».** `apiFetch` est une instance `$fetch` qui attache
   le Bearer (`onRequest`) et, sur `401`, rejoue une fois (`retry: 1`,
   `retryStatusCodes: [401]`). L'`onResponseError` — attendu par ofetch avant le
   retry — déclenche `refresh()`, qui mémorise la promesse en cours
   (`refreshPromise`) : plusieurs requêtes qui prennent `401` **en même temps**
   partagent **un seul** `POST /auth/refresh`, puis chacune est rejouée avec le
   nouveau token. `login` et `refresh` utilisent le `$fetch` nu (pas d'intercepteur)
   pour éviter toute boucle. Si le refresh échoue, la session est nettoyée.
4. **Protection de route + redirection.** `middleware/auth.ts` renvoie vers
   `/login?redirect=<chemin demandé>` si non connecté ; après connexion,
   `login.vue` suit ce `redirect` — **uniquement** s'il s'agit d'un chemin
   interne (`^/(?!/)`), sinon `/account` (anti open-redirect).
5. **`expiresInMins = 1`.** Durée volontairement courte (demandée pour le test) afin
   d'observer facilement le refresh ; à remonter (p. ex. 60) pour une vraie session.

## Point de vigilance corrigé (bug introduit puis résolu)

`/auth/me` renvoie l'enregistrement utilisateur **complet** (dont `password`,
`bank`, `crypto`, `address`). Un premier jet faisait `user.value = await
apiFetch<AuthUser>('/auth/me')` : le type TS `AuthUser` ne filtre **rien** à
l'exécution, donc tout l'objet était stocké puis **sérialisé dans le payload SSR**
(le mot de passe apparaissait dans le HTML). Correctif : `toAuthUser()` ne retient
que les champs publics (`id`, `username`, `email`, `firstName`, `lastName`,
`gender`, `image`), utilisé par `login` et `fetchMe`.

## Vérifications

- `npm run lint` / `npm run typecheck` au vert.
- SSR (curl) : `/` et `/login` rendus côté serveur ; `/account` **sans** cookie
  → `302 /login?redirect=/account` ; **avec** session → rendu connecté dès le
  SSR (« Bonjour … »), aucune fuite de `password` / `bank` / `crypto` dans le HTML.
- Refresh réel (`expiresInMins: 1`) : access token expiré après ~65 s → `/auth/me`
  = `401` → refresh déclenché pendant le SSR de `/account` → nouveau cookie
  `champashop_access_token` posé → requête rejouée → page connectée rendue (`200`).

## À tester manuellement en navigateur

- Connexion/déconnexion et persistance au rechargement (pas de clignotement
  déconnecté).
- Accès direct à `/account` déconnecté → redirection, puis retour sur `/account`
  après connexion.
- Single-flight : avec `expiresInMins: 1`, déclencher plusieurs requêtes
  authentifiées simultanées après expiration → un seul `POST /auth/refresh` dans
  l'onglet réseau.
