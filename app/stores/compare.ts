import { defineStore } from 'pinia'
import { computed, nextTick, ref } from 'vue'
import { MAX_COMPARE, parseCompareIds } from '../utils/compare'

const COOKIE_KEY = 'compare'
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30 // 30 days

/** Announced to screen readers when the comparator is full (F6, aria-live). */
export const COMPARE_FULL_MESSAGE =
  'Comparateur plein : retirez un produit pour en ajouter un autre.'

/**
 * Comparator store (F6).
 *
 * The cookie holds product identifiers only (max 3), so the selection is
 * present on the very first server byte — the comparison bar and the
 * `/comparer` page render server-side with no hydration flash.
 *
 * Every read goes through `parseCompareIds`, and a cookie whose normalized
 * form differs from its raw value is rewritten once at init (tampered or
 * stale cookie → repaired, never a crash), mirroring the recently-viewed
 * store.
 */
export const useCompareStore = defineStore('compare', () => {
  const cookie = useCookie<number[] | string | null>(COOKIE_KEY, {
    default: () => null,
    maxAge: MAX_AGE_SECONDS,
    sameSite: 'lax'
  })

  const ids = computed<number[]>(() => parseCompareIds(cookie.value, MAX_COMPARE))

  // Self-heal: if the raw cookie is not exactly the clean list, rewrite it.
  const hasRawCookie = cookie.value !== null && cookie.value !== undefined
  const isClean =
    Array.isArray(cookie.value) &&
    cookie.value.length === ids.value.length &&
    cookie.value.every((entry, index) => entry === ids.value[index])
  if (hasRawCookie && !isClean) {
    cookie.value = ids.value
  }

  // Live-region message, owned by the store because the trigger (a card
  // button) and the announcer (the comparison bar) are different components.
  // The bar shows it both to screen readers (aria-live) and on screen (a
  // visible banner), so a sighted user also gets feedback on the 4th attempt.
  const announcement = ref('')

  // Auto-dismiss the visible banner so it does not look like a stuck state.
  // Per-instance (declared in the setup) and client-only — announcements only
  // happen on a real click.
  let dismissTimer: ReturnType<typeof setTimeout> | null = null
  function clearDismiss(): void {
    if (dismissTimer) {
      clearTimeout(dismissTimer)
      dismissTimer = null
    }
  }

  function setAnnouncement(message: string): void {
    clearDismiss()
    announcement.value = message
  }

  function persist(next: number[]): void {
    cookie.value = parseCompareIds(next, MAX_COMPARE)
  }

  // Re-fire the live region even when the text is unchanged (a second 4th
  // attempt): screen readers skip an aria-live node whose content did not
  // change, so clear it and re-set it on the next tick.
  async function announceFull(): Promise<void> {
    clearDismiss()
    announcement.value = ''
    await nextTick()
    announcement.value = COMPARE_FULL_MESSAGE
    if (import.meta.client) {
      dismissTimer = setTimeout(() => {
        announcement.value = ''
        dismissTimer = null
      }, 6000)
    }
  }

  function has(id: number): boolean {
    return ids.value.includes(id)
  }

  const count = computed<number>(() => ids.value.length)
  const isFull = computed<boolean>(() => ids.value.length >= MAX_COMPARE)
  const isEmpty = computed<boolean>(() => ids.value.length === 0)

  function add(id: number): void {
    if (!Number.isInteger(id) || id <= 0 || has(id)) return
    if (ids.value.length >= MAX_COMPARE) {
      void announceFull()
      return
    }
    setAnnouncement('')
    persist([...ids.value, id])
  }

  function remove(id: number): void {
    setAnnouncement('')
    persist(ids.value.filter((existing) => existing !== id))
  }

  function toggle(id: number): void {
    if (has(id)) remove(id)
    else add(id)
  }

  /** Overwrite the selection (used by the "adopt this selection" action). */
  function replace(next: number[]): void {
    setAnnouncement('')
    persist(next)
  }

  function clear(): void {
    setAnnouncement('')
    persist([])
  }

  return {
    ids,
    count,
    isFull,
    isEmpty,
    announcement,
    has,
    add,
    remove,
    toggle,
    replace,
    clear
  }
})
