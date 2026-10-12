/**
 * Recently viewed history (F7) — pure functions, no Vue or Pinia dependency.
 *
 * The cookie only ever contains product identifiers (ints), never product
 * data, so it stays tiny and is rendered as-is by the server.
 *
 * - `parseRecentlyViewedCookie` is the single trust boundary for the cookie:
 *   any garbage a user could hand-write ("abc", "1,,2", "5,5,5", null,
 *   truncated JSON…) yields a clean, deduplicated, capped list instead of
 *   throwing.
 * - `pushRecentlyViewed` enforces "most recent first, no duplicate, max 10".
 */

const DEFAULT_MAX = 10

/**
 * Keep only strictly positive integers, drop duplicates (first occurrence
 * wins = most recent stays at the head) and cap the list.
 */
function normalizeIds(value: unknown, max: number): number[] {
  if (!Array.isArray(value)) return []

  const seen = new Set<number>()
  const result: number[] = []

  for (const entry of value) {
    if (typeof entry !== 'number' || !Number.isInteger(entry) || entry <= 0) continue
    if (seen.has(entry)) continue
    seen.add(entry)
    result.push(entry)
    if (result.length === max) break
  }

  return result
}

/**
 * Parse whatever was found in the `recently_viewed` cookie.
 *
 * Accepts:
 * - `number[]` (already deserialized by `useCookie`)
 * - a JSON array string (`"[3,17,42]"` — the format we write)
 * - any other string: JSON first, then comma-separated fallback
 *   (`"5,5,5"` → `[5]`, `"1,,2"` → `[1, 2]`)
 * - anything else (`null`, objects, booleans, nested arrays…) → `[]`
 *
 * Never throws. Always returns at most `max` unique positive integers.
 */
export function parseRecentlyViewedCookie(raw: unknown, max = DEFAULT_MAX): number[] {
  if (Array.isArray(raw)) return normalizeIds(raw, max)

  if (typeof raw === 'string') {
    const trimmed = raw.trim()
    if (trimmed === '') return []

    // Comma-separated fallback: Number() turns "5" → 5, "abc" → NaN,
    // "" → 0 — all of which normalizeIds then rejects. Strictly for the
    // CSV path: a JSON array keeps number-only entries.
    const fromCsv = (): number[] =>
      normalizeIds(
        trimmed.split(',').map((part) => Number(part.trim())),
        max
      )

    try {
      const parsed: unknown = JSON.parse(trimmed)
      if (Array.isArray(parsed)) return normalizeIds(parsed, max)
      if (typeof parsed === 'number') return normalizeIds([parsed], max)
      // Valid JSON but not ids ("null", true, an object) → corrupted
      return []
    } catch {
      // Looks like broken JSON ("[1,2") → corrupted, never salvage partial ids
      if (trimmed.startsWith('[') || trimmed.startsWith('{')) return []
      // Plain CSV ("abc", "1,,2", "5,5,5") → CSV attempt
      return fromCsv()
    }
  }

  return []
}

/**
 * Return the list with `id` moved to the head (a revisit refreshes the
 * position), no duplicate, capped at `max` (oldest evicted).
 * An invalid `id` (0, negative, float, NaN) leaves the list unchanged.
 */
export function pushRecentlyViewed(ids: number[], id: number, max = DEFAULT_MAX): number[] {
  const current = parseRecentlyViewedCookie(ids, max)
  if (!Number.isInteger(id) || id <= 0) return current
  return [id, ...current.filter((existing) => existing !== id)].slice(0, max)
}
