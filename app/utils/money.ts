/**
 * Money helpers — pure functions, all amounts in integer cents.
 * DummyJSON `price` is in euros (float), so convert once at the boundary.
 */

export function eurosToCents(euros: number): number {
  return Math.round(euros * 100)
}

export function centsToEuros(cents: number): number {
  return cents / 100
}

const eurFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR'
})

export function formatCents(cents: number): string {
  return eurFormatter.format(centsToEuros(cents))
}

/** Discount badge value, e.g. `-12 %` from `discountPercentage: 12.4`. */
export function discountBadge(discountPercentage: number): string {
  return `-${Math.round(discountPercentage)} %`
}
