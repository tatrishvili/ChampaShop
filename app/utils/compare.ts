/**
 * Product comparator selection (F6) — pure functions, no Vue or Pinia.
 *
 * The comparator stores product identifiers only (never product data), both
 * in the `compare` cookie and in the `/comparer?ids=` URL. This module is the
 * single trust boundary for both sources: whatever garbage a user could hand
 * write (a tampered cookie, a crafted link) is turned into a clean list
 * instead of throwing.
 *
 * Rules enforced everywhere: strictly positive integers, no duplicates
 * (first occurrence wins, so the caller's order is preserved), capped at
 * `MAX_COMPARE` entries.
 */

export const MAX_COMPARE = 3

/**
 * Keep only strictly positive integers, drop duplicates (first wins) and cap
 * the list. Entries may be numbers (cookie `number[]`) or strings (CSV from
 * the URL); both are coerced with `Number`, and anything that is not a clean
 * positive integer is dropped.
 */
function normalizeIds(value: unknown, max: number): number[] {
  if (!Array.isArray(value)) return []

  const seen = new Set<number>()
  const result: number[] = []

  for (const entry of value) {
    const n = typeof entry === 'number' ? entry : Number(String(entry).trim())
    if (!Number.isInteger(n) || n <= 0) continue
    if (seen.has(n)) continue
    seen.add(n)
    result.push(n)
    if (result.length === max) break
  }

  return result
}

/**
 * Parse whatever was found in the `compare` cookie or the `ids` query param.
 *
 * Accepts:
 * - `number[]` (already deserialized by `useCookie`)
 * - a JSON array string (`"[3,17,42]"`)
 * - a comma-separated string (`"3,17,42"` — the URL format, also `"3,3"` →
 *   `[3]`, `"a,2"` → `[2]`)
 * - anything else (`null`, objects, booleans, broken JSON) → `[]`
 *
 * Never throws. Returns at most `max` unique positive integers.
 */
export function parseCompareIds(raw: unknown, max = MAX_COMPARE): number[] {
  if (Array.isArray(raw)) return normalizeIds(raw, max)

  if (typeof raw === 'string') {
    const trimmed = raw.trim()
    if (trimmed === '') return []

    try {
      const parsed: unknown = JSON.parse(trimmed)
      if (Array.isArray(parsed)) return normalizeIds(parsed, max)
      if (typeof parsed === 'number') return normalizeIds([parsed], max)
      // Valid JSON but not ids ("null", true, an object) → corrupted.
      return []
    } catch {
      // Broken JSON ("[1,2") is never salvaged into partial ids.
      if (trimmed.startsWith('[') || trimmed.startsWith('{')) return []
      // Plain CSV from the URL: split and coerce.
      return normalizeIds(trimmed.split(','), max)
    }
  }

  return []
}

/** Canonical string form of a selection, matching the URL format (`3,17,42`). */
export function compareIdsToParam(ids: number[]): string {
  return ids.join(',')
}

/** Order-insensitive equality of two id selections. */
export function compareSelectionsEqual(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false
  const sortedA = [...a].sort((x, y) => x - y)
  const sortedB = [...b].sort((x, y) => x - y)
  return sortedA.every((value, index) => value === sortedB[index])
}
