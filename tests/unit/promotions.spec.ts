import { describe, expect, it } from 'vitest'
import { computeCart, type CartLine } from '../../app/utils/promotions'

/**
 * These 8 scenarios reproduce exactly the table from the spec PDF.
 * All expected amounts are in cents to stay consistent with computeCart
 * (grossCents, totalCents, etc.).
 */
describe('computeCart — acceptance scenarios from the spec', () => {
  it('Scenario 1: 3 × beauty at €9.99, no code', () => {
    const lines: CartLine[] = [
      { productId: 1, category: 'beauty', unitPriceCents: 999, quantity: 3 }
    ]

    const result = computeCart(lines)

    expect(result.grossCents).toBe(2997)
    expect(result.discounts).toEqual([
      { id: 'BEAUTY_3', label: 'Beauty discount (-10%)', amountCents: 300 }
    ])
    expect(result.shippingCents).toBe(490)
    expect(result.totalCents).toBe(3187)
  })

  it('Scenario 2: 3 × beauty at €19.99, TROYES10 (capped)', () => {
    const lines: CartLine[] = [
      { productId: 2, category: 'beauty', unitPriceCents: 1999, quantity: 3 }
    ]

    const result = computeCart(lines, 'TROYES10')

    expect(result.grossCents).toBe(5997)
    expect(result.discounts).toEqual([
      { id: 'BEAUTY_3', label: 'Beauty discount (-10%)', amountCents: 600 },
      { id: 'TROYES10', label: 'Code TROYES10', amountCents: 899 }
    ])
    expect(result.shippingCents).toBe(490)
    expect(result.totalCents).toBe(4988)
    // The code was indeed reduced because of the 25% cap
    expect(result.messages.some((m) => m.includes('cap'))).toBe(true)
  })

  it('Scenario 3: 1 × beauty (€39) + 1 × groceries (€15), TROYES10', () => {
    const lines: CartLine[] = [
      { productId: 3, category: 'beauty', unitPriceCents: 3900, quantity: 1 },
      { productId: 4, category: 'groceries', unitPriceCents: 1500, quantity: 1 }
    ]

    const result = computeCart(lines, 'TROYES10')

    expect(result.grossCents).toBe(5400)
    // Fewer than 3 cumulative beauty items -> no beauty discount
    expect(result.discounts).toEqual([
      { id: 'TROYES10', label: 'Code TROYES10', amountCents: 1000 }
    ])
    expect(result.shippingCents).toBe(490)
    expect(result.totalCents).toBe(4890)
  })

  it('Scenario 4: 1 × furniture at €89.99, TROYES10 (shipping always due)', () => {
    const lines: CartLine[] = [
      { productId: 5, category: 'furniture', unitPriceCents: 8999, quantity: 1 }
    ]

    const result = computeCart(lines, 'TROYES10')

    expect(result.grossCents).toBe(8999)
    expect(result.discounts).toEqual([
      { id: 'TROYES10', label: 'Code TROYES10', amountCents: 1000 }
    ])
    // Furniture => never free shipping, even if the threshold is reached
    expect(result.shippingCents).toBe(490)
    expect(result.totalCents).toBe(8489)
  })

  it('Scenario 5: 2 × laptops at €45.00, TROYES10 (free shipping)', () => {
    const lines: CartLine[] = [
      { productId: 6, category: 'laptops', unitPriceCents: 4500, quantity: 2 }
    ]

    const result = computeCart(lines, 'TROYES10')

    expect(result.grossCents).toBe(9000)
    expect(result.discounts).toEqual([
      { id: 'TROYES10', label: 'Code TROYES10', amountCents: 1000 }
    ])
    expect(result.shippingCents).toBe(0)
    expect(result.totalCents).toBe(8000)
  })

  it('Scenario 6: 4 × beauty at €12.50, TROYES10 rejected (subtotal <= €50)', () => {
    const lines: CartLine[] = [
      { productId: 7, category: 'beauty', unitPriceCents: 1250, quantity: 4 }
    ]

    const result = computeCart(lines, 'TROYES10')

    expect(result.grossCents).toBe(5000)
    expect(result.discounts).toEqual([
      { id: 'BEAUTY_3', label: 'Beauty discount (-10%)', amountCents: 500 }
    ])
    expect(result.messages.some((m) => m.includes('rejected'))).toBe(true)
    expect(result.shippingCents).toBe(490)
    expect(result.totalCents).toBe(4990)
  })

  it('Scenario 7: 2 × groceries at €30.00, code " troyes10 " (case/spacing)', () => {
    const lines: CartLine[] = [
      { productId: 8, category: 'groceries', unitPriceCents: 3000, quantity: 2 }
    ]

    const result = computeCart(lines, ' troyes10 ')

    expect(result.grossCents).toBe(6000)
    expect(result.discounts).toEqual([
      { id: 'TROYES10', label: 'Code TROYES10', amountCents: 1000 }
    ])
    expect(result.shippingCents).toBe(490)
    expect(result.totalCents).toBe(5490)
  })

  it('Scenario 8: 1 × groceries at €79.99, no code', () => {
    const lines: CartLine[] = [
      { productId: 9, category: 'groceries', unitPriceCents: 7999, quantity: 1 }
    ]

    const result = computeCart(lines)

    expect(result.grossCents).toBe(7999)
    expect(result.discounts).toEqual([])
    expect(result.shippingCents).toBe(490)
    expect(result.totalCents).toBe(8489)
  })
})

describe('computeCart — edge cases', () => {
  it('an empty cart returns zero plus the shipping fee', () => {
    const result = computeCart([])

    expect(result.grossCents).toBe(0)
    expect(result.discounts).toEqual([])
    expect(result.totalCents).toBe(490)
  })

  it('an unknown promo code adds a message and applies no discount', () => {
    const lines: CartLine[] = [
      { productId: 10, category: 'groceries', unitPriceCents: 6000, quantity: 1 }
    ]

    const result = computeCart(lines, 'FAKECODE')

    expect(result.discounts).toEqual([])
    expect(result.messages.some((m) => m.includes('Unknown'))).toBe(true)
  })

  it('a line with quantity 0 does not contribute to the total', () => {
    const lines: CartLine[] = [
      { productId: 11, category: 'beauty', unitPriceCents: 1000, quantity: 0 },
      { productId: 12, category: 'groceries', unitPriceCents: 2000, quantity: 1 }
    ]

    const result = computeCart(lines)

    expect(result.grossCents).toBe(2000)
  })

  it('an empty string as promo code is treated as no code at all', () => {
    const lines: CartLine[] = [
      { productId: 13, category: 'groceries', unitPriceCents: 6000, quantity: 1 }
    ]

    const result = computeCart(lines, '')

    expect(result.discounts).toEqual([])
    expect(result.messages).toEqual([])
  })
})