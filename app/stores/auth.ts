import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { AuthUser, LoginResponse, RefreshResponse } from '../types/auth'

const BASE_URL = 'https://dummyjson.com'

// Access-token lifetime requested at login/refresh. One hour gives a smooth
// session for everyday use; the single-flight refresh below still kicks in when
// it expires. Lower this to 1 to observe the refresh flow quickly (per the F5
// spec: "Testez avec expiresInMins: 1").
const ACCESS_TOKEN_EXPIRES_IN_MINS = 60

/** Demo account provided by dummyjson, used to prefill the login form. */
export const DEMO_CREDENTIALS = {
  username: 'emilys',
  password: 'emilyspass'
} as const

/**
 * Auth store (F5).
 *
 * Tokens live in cookies so the session survives a reload and is readable during
 * SSR; the user is loaded server-side from the access-token cookie (see the
 * `auth-init` plugin) to avoid any flash of logged-out state on reload.
 *
 * `apiFetch` is an authenticated $fetch instance: it attaches the Bearer header and,
 * on a 401, refreshes the token in "single-flight" mode — any number of concurrent
 * 401s share ONE /auth/refresh call — then replays each failed request once.
 */
export const useAuthStore = defineStore('auth', () => {
  // httpOnly is intentionally left off: the client reads these to attach the
  // `Authorization: Bearer` header, so JS must be able to read them. `secure` is
  // enabled outside dev (http on localhost would silently drop secure cookies).
  const accessToken = useCookie<string | null>('champashop_access_token', {
    default: () => null,
    maxAge: 60 * 60, // 1h cookie window; the JWT itself expires sooner (see above)
    sameSite: 'lax',
    secure: !import.meta.dev
  })
  const refreshToken = useCookie<string | null>('champashop_refresh_token', {
    default: () => null,
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: 'lax',
    secure: !import.meta.dev
  })

  const user = ref<AuthUser | null>(null)

  const isAuthenticated = computed<boolean>(() => user.value !== null)
  const displayName = computed<string>(
    () => user.value?.firstName || user.value?.username || ''
  )

  // Single-flight guard: holds the in-flight refresh promise so concurrent callers
  // join it instead of each firing their own /auth/refresh. Kept as a closure
  // variable (not store state) so it is per-instance and never serialized.
  let refreshPromise: Promise<boolean> | null = null

  function clearSession(): void {
    accessToken.value = null
    refreshToken.value = null
    user.value = null
  }

  async function doRefresh(): Promise<boolean> {
    if (!refreshToken.value) {
      clearSession()
      return false
    }
    try {
      const res = await $fetch<RefreshResponse>(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        body: {
          refreshToken: refreshToken.value,
          expiresInMins: ACCESS_TOKEN_EXPIRES_IN_MINS
        }
      })
      accessToken.value = res.accessToken
      refreshToken.value = res.refreshToken
      return true
    } catch {
      // Refresh token is invalid/expired -> drop the session cleanly.
      clearSession()
      return false
    }
  }

  /**
   * Refresh the token pair, single-flight. Concurrent calls (e.g. several requests
   * that 401 at once) all await the same promise, so only one /auth/refresh is sent.
   */
  function refresh(): Promise<boolean> {
    if (!refreshPromise) {
      refreshPromise = doRefresh().finally(() => {
        refreshPromise = null
      })
    }
    return refreshPromise
  }

  // Authenticated fetch instance. onRequest attaches the current access token;
  // on a 401 ofetch retries once, and the awaited onResponseError refreshes the
  // token first so the retry goes out with the new one.
  const apiFetch = $fetch.create({
    baseURL: BASE_URL,
    retry: 1,
    retryStatusCodes: [401],
    onRequest({ options }) {
      if (accessToken.value) {
        const headers = new Headers(options.headers)
        headers.set('Authorization', `Bearer ${accessToken.value}`)
        options.headers = headers
      }
    },
    async onResponseError({ response }) {
      if (response.status === 401) {
        await refresh()
      }
    }
  })

  // Keep only the fields we need. /auth/me returns the FULL dummyjson user record
  // (password, bank, crypto, address, ...); storing it as-is would leak those into
  // the serialized SSR payload, so we pick an explicit AuthUser shape.
  function toAuthUser(u: AuthUser): AuthUser {
    return {
      id: u.id,
      username: u.username,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      gender: u.gender,
      image: u.image
    }
  }

  async function fetchMe(): Promise<void> {
    try {
      user.value = toAuthUser(await apiFetch<AuthUser>('/auth/me'))
    } catch {
      // Access token invalid and refresh failed -> ensure a clean logged-out state.
      clearSession()
    }
  }

  async function login(username: string, password: string): Promise<void> {
    // Plain $fetch (no interceptor) so a bad-credentials 401/400 is not mistaken
    // for an expired token and does not trigger a refresh loop.
    const res = await $fetch<LoginResponse>(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: { username, password, expiresInMins: ACCESS_TOKEN_EXPIRES_IN_MINS }
    })
    accessToken.value = res.accessToken
    refreshToken.value = res.refreshToken
    user.value = toAuthUser(res)
  }

  async function logout(): Promise<void> {
    clearSession()
    await navigateTo('/')
  }

  /**
   * Restore the session on app start: if a token cookie is present but the user is
   * not loaded yet, fetch it. Runs during SSR so the first paint already reflects
   * the signed-in state (no flash); the user is then serialized to the client, so
   * the `!user.value` guard prevents a duplicate /auth/me call on hydration.
   */
  async function init(): Promise<void> {
    if (accessToken.value && !user.value) {
      await fetchMe()
    }
  }

  return {
    user,
    isAuthenticated,
    displayName,
    apiFetch,
    login,
    logout,
    refresh,
    fetchMe,
    init
  }
})
