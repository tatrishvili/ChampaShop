import { defineStore } from 'pinia'
import { computed } from 'vue'

/** The subset of the dummyjson user we keep in the session. */
export interface AuthUser {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  gender: string
  image: string
}

/** Raw shape returned by POST https://dummyjson.com/auth/login. */
interface LoginResponse extends AuthUser {
  accessToken?: string
  refreshToken?: string
  token?: string
}

interface Session {
  user: AuthUser
  token: string
}

const COOKIE_KEY = 'champashop-auth'

/** Demo credentials provided by dummyjson (same API the rest of the app uses). */
export const DEMO_CREDENTIALS = {
  username: 'emilys',
  password: 'emilyspass'
} as const

/**
 * Auth store.
 * Mirrors the cart store: a Nuxt `useCookie` holds the session so SSR and the
 * client agree and a reload keeps the user signed in. Authentication itself
 * goes through dummyjson's /auth/login, consistent with the catalog/cart.
 */
export const useAuthStore = defineStore('auth', () => {
  const session = useCookie<Session | null>(COOKIE_KEY, {
    default: () => null,
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax'
  })

  const isAuthenticated = computed<boolean>(() => session.value !== null)
  const user = computed<AuthUser | null>(() => session.value?.user ?? null)
  const displayName = computed<string>(
    () => user.value?.firstName || user.value?.username || ''
  )

  async function login(username: string, password: string): Promise<void> {
    const res = await $fetch<LoginResponse>('https://dummyjson.com/auth/login', {
      method: 'POST',
      body: { username, password, expiresInMins: 60 }
    })
    session.value = {
      user: {
        id: res.id,
        username: res.username,
        email: res.email,
        firstName: res.firstName,
        lastName: res.lastName,
        gender: res.gender,
        image: res.image
      },
      token: res.accessToken ?? res.token ?? ''
    }
  }

  function logout(): void {
    session.value = null
  }

  return { isAuthenticated, user, displayName, login, logout }
})
