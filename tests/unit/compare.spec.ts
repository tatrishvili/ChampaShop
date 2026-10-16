import { describe, expect, it } from 'vitest'
import {
  MAX_COMPARE,
  compareIdsToParam,
  compareSelectionsEqual,
  parseCompareIds
} from '../../app/utils/compare'

describe('parseCompareIds', () => {
  it('keeps a clean number array in order', () => {
    expect(parseCompareIds([3, 17, 42])).toEqual([3, 17, 42])
  })

  it('parses a comma-separated URL string', () => {
    expect(parseCompareIds('3,17,42')).toEqual([3, 17, 42])
  })

  it('parses a JSON array string (hand-written cookie)', () => {
    expect(parseCompareIds('[3,17]')).toEqual([3, 17])
  })

  it('drops duplicates, first occurrence wins', () => {
    expect(parseCompareIds('3,3,17')).toEqual([3, 17])
  })

  it(`caps the list at ${MAX_COMPARE}`, () => {
    expect(parseCompareIds('1,2,3,4,5')).toEqual([1, 2, 3])
  })

  it('ignores non-numeric and non-positive entries', () => {
    expect(parseCompareIds('a,2,-1,0,3.5,17')).toEqual([2, 17])
  })

  it('returns [] for empty, null, broken JSON and non-id JSON', () => {
    expect(parseCompareIds('')).toEqual([])
    expect(parseCompareIds(null)).toEqual([])
    expect(parseCompareIds(undefined)).toEqual([])
    expect(parseCompareIds('[1,2')).toEqual([])
    expect(parseCompareIds('{"a":1}')).toEqual([])
    expect(parseCompareIds('true')).toEqual([])
  })

  it('honours a custom max', () => {
    expect(parseCompareIds('1,2,3,4', 2)).toEqual([1, 2])
  })
})

describe('compareIdsToParam', () => {
  it('joins ids into the canonical URL form', () => {
    expect(compareIdsToParam([3, 17, 42])).toBe('3,17,42')
    expect(compareIdsToParam([])).toBe('')
  })
})

describe('compareSelectionsEqual', () => {
  it('is order-insensitive', () => {
    expect(compareSelectionsEqual([3, 17], [17, 3])).toBe(true)
  })

  it('distinguishes different sets and lengths', () => {
    expect(compareSelectionsEqual([3, 17], [3, 18])).toBe(false)
    expect(compareSelectionsEqual([3], [3, 17])).toBe(false)
    expect(compareSelectionsEqual([], [])).toBe(true)
  })
})
