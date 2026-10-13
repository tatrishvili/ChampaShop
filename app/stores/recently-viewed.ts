import { defineStore } from 'pinia'
import { computed } from 'vue'
import { parseRecentlyViewedCookie, pushRecentlyViewed } from '../utils/recently-viewed'

const COOKIE_KEY = 'recently_viewed'
const MAX_IDS = 10
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30 // 30 days

/**
 * Recently viewed store (F7).
 *
 * The cookie holds product identifiers only — tiny enough for SSR to render
 * the history on the very first byte, no hydration flash.
 *
 * `useCookie` hands us either a `number[]` (healthy, JSON-encoded by Nuxt)
 * or a raw string when the cookie was edited/corrupted by hand. Every read
 * goes through `parseRecentlyViewedCookie`, and a cookie whose normalized
 * form differs from its raw value is rewritten once at init (ignored +
 * reset, never a crash).
 */
export const useRecentlyViewedStore = defineStore('recentlyViewed', () => {
  const cookie = useCookie<number[] | string | null>(COOKIE_KEY, {
    default: () => null,
    maxAge: MAX_AGE_SECONDS,
    sameSite: 'lax'
  })

  const ids = computed<number[]>(() => parseRecentlyViewedCookie(cookie.value, MAX_IDS))

  // Corruption tolerance: if the raw cookie is not exactly the clean list,
  // replace it with the normalized version ([] when beyond repair).
  const hasRawCookie = cookie.value !== null && cookie.value !== undefined
  const isClean = Array.isArray(cookie.value) && cookie.value.every((entry, index) => entry === ids.value[index]) && cookie.value.length === ids.value.length
  if (hasRawCookie && !isClean) {
    cookie.value = ids.value
  }

  function persist(next: number[]): void {
    cookie.value = next
  }

  /** A visit moves the id to the head; a revisit must not duplicate it. */
  function record(id: number): void {
    persist(pushRecentlyViewed(ids.value, id, MAX_IDS))
  }

  function clear(): void {
    persist([])
  }

  return { ids, record, clear }
})
