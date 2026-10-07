import { describe, expect, it } from 'vitest'
import { discountBadge, eurosToCents, formatCents } from '../../app/utils/money'

describe('money utils', () => {
  it('converts euros to cents with commercial rounding', () => {
    expect(eurosToCents(9.99)).toBe(999)
    expect(eurosToCents(19.995)).toBe(2000)
    expect(eurosToCents(0)).toBe(0)
  })

  it('formats cents as EUR', () => {
    expect(formatCents(3187)).toContain('31,87')
  })

  it('builds a discount badge', () => {
    expect(discountBadge(10.48)).toBe('-10 %')
  })
})
