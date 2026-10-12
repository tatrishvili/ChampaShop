import { describe, expect, it } from 'vitest'
import { parseRecentlyViewedCookie, pushRecentlyViewed } from '../../app/utils/recently-viewed'

describe('parseRecentlyViewedCookie', () => {
  it('parses the JSON array string we write into the cookie', () => {
    expect(parseRecentlyViewedCookie('[3,17,42]')).toEqual([3, 17, 42])
  })

  it('accepts an already-deserialized array', () => {
    expect(parseRecentlyViewedCookie([3, 17, 42])).toEqual([3, 17, 42])
  })

  it('returns [] for null, undefined and non-string primitives', () => {
    expect(parseRecentlyViewedCookie(null)).toEqual([])
    expect(parseRecentlyViewedCookie(undefined)).toEqual([])
    expect(parseRecentlyViewedCookie(42)).toEqual([])
    expect(parseRecentlyViewedCookie(true)).toEqual([])
  })

  it('returns [] for an empty array and an empty string', () => {
    expect(parseRecentlyViewedCookie([])).toEqual([])
    expect(parseRecentlyViewedCookie('')).toEqual([])
    expect(parseRecentlyViewedCookie('   ')).toEqual([])
  })

  it('returns [] for the non-numeric entry "abc"', () => {
    expect(parseRecentlyViewedCookie('abc')).toEqual([])
  })

  it('keeps valid ids in "1,,2" and drops the empty slot', () => {
    expect(parseRecentlyViewedCookie('1,,2')).toEqual([1, 2])
  })

  it('deduplicates "5,5,5" down to [5]', () => {
    expect(parseRecentlyViewedCookie('5,5,5')).toEqual([5])
    expect(parseRecentlyViewedCookie('[5,5,5]')).toEqual([5])
  })

  it('tolerates a truncated / corrupted JSON string', () => {
    expect(parseRecentlyViewedCookie('[1,2')).toEqual([])
    expect(parseRecentlyViewedCookie('{"a":1}')).toEqual([])
  })

  it('drops non-integer, negative, zero and non-number entries', () => {
    expect(parseRecentlyViewedCookie([1.5, -3, 0, Number.NaN, '7', null, { id: 8 }])).toEqual([])
    expect(parseRecentlyViewedCookie([4, 1.5, -3, 0, 9])).toEqual([4, 9])
  })

  it('drops nested arrays (JSON array of arrays)', () => {
    expect(parseRecentlyViewedCookie('[[1,2],[3]]')).toEqual([])
  })

  it('caps the list at max (default 10, oldest evicted)', () => {
    const many = Array.from({ length: 15 }, (_, i) => i + 1)
    expect(parseRecentlyViewedCookie(many)).toHaveLength(10)
    expect(parseRecentlyViewedCookie(many)).toEqual(many.slice(0, 10))
    expect(parseRecentlyViewedCookie(many, 3)).toEqual([1, 2, 3])
  })

  it('preserves the cookie order (most recent first)', () => {
    expect(parseRecentlyViewedCookie('[42,3,17]')).toEqual([42, 3, 17])
  })
})

describe('pushRecentlyViewed', () => {
  it('adds a new id at the head', () => {
    expect(pushRecentlyViewed([3, 17], 42)).toEqual([42, 3, 17])
  })

  it('moves an already present id to the head without duplicating it', () => {
    expect(pushRecentlyViewed([3, 17, 42], 17)).toEqual([17, 3, 42])
  })

  it('starts from an empty list', () => {
    expect(pushRecentlyViewed([], 5)).toEqual([5])
  })

  it('evicts the oldest id beyond the maximum of 10', () => {
    const ten = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
    expect(pushRecentlyViewed(ten, 11)).toEqual([11, 10, 9, 8, 7, 6, 5, 4, 3, 2])
    expect(pushRecentlyViewed(ten, 11)).toHaveLength(10)
  })

  it('honours a custom max', () => {
    expect(pushRecentlyViewed([1, 2, 3], 4, 3)).toEqual([4, 1, 2])
  })

  it('ignores an invalid id and returns the cleaned list unchanged', () => {
    expect(pushRecentlyViewed([3, 17], 0)).toEqual([3, 17])
    expect(pushRecentlyViewed([3, 17], -2)).toEqual([3, 17])
    expect(pushRecentlyViewed([3, 17], 1.5)).toEqual([3, 17])
    expect(pushRecentlyViewed([3, 17], Number.NaN)).toEqual([3, 17])
  })

  it('cleans a dirty input list before pushing', () => {
    expect(pushRecentlyViewed([1.5, -3, 2, 2], 7)).toEqual([7, 2])
  })
})
