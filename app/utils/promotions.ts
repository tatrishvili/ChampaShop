/**
 * Promotions engine — pure function, no dependency on Vue or Pinia.
 * All amounts are handled in cents (integers) to avoid floating-point
 * rounding errors.
 *
 * Rules applied in this order (per the week-1 spec):
 *   1. Beauty discount: -10% if >= 3 beauty items (cumulative quantity)
 *   2. TROYES10 code: -€10.00 if the subtotal after the beauty discount
 *      is strictly greater than €50.00
 *   3. Cap: total discounts never exceed 25% of the gross subtotal
 *      (the promo code is the one reduced if the cap is exceeded)
 *   4. Shipping: €4.90, free if the amount after discounts is >= €80.00,
 *      unless the cart contains a "furniture" product
 */

export interface CartLine {
  productId: number
  category: string
  unitPriceCents: number
  quantity: number
}

export interface AppliedDiscount {
  id: 'BEAUTY_3' | 'TROYES10'
  label: string
  amountCents: number
}

export interface CartSummary {
  grossCents: number
  discounts: AppliedDiscount[]
  shippingCents: number
  totalCents: number
  messages: string[] // e.g. why a promo code was rejected
}

const SHIPPING_CENTS = 490
const FREE_SHIPPING_THRESHOLD_CENTS = 8000
const BEAUTY_CATEGORY = 'beauty'
const BEAUTY_MIN_QUANTITY = 3
const BEAUTY_DISCOUNT_RATE = 0.1
const TROYES10_CODE = 'TROYES10'
const TROYES10_DISCOUNT_CENTS = 1000
const TROYES10_MIN_SUBTOTAL_CENTS = 5000 // strictly greater than €50.00
const DISCOUNT_CAP_RATE = 0.25
const FURNITURE_CATEGORY = 'furniture'

/**
 * Round half up (commercial rounding). JS's Math.round already rounds
 * .5 towards +Infinity for positive numbers, which matches the expected
 * behavior here (all amounts in this domain are positive).
 */
function roundHalfUp(value: number): number {
  return Math.round(value)
}

function centsToEuros(cents: number): string {
  return (cents / 100).toFixed(2)
}

export function computeCart(lines: CartLine[], promoCode?: string): CartSummary {
  const messages: string[] = []
  const discounts: AppliedDiscount[] = []

  const grossCents = lines.reduce(
    (sum, line) => sum + line.unitPriceCents * line.quantity,
    0
  )

  // --- Rule 1: beauty discount -----------------------------------------
  const beautyLines = lines.filter((line) => line.category === BEAUTY_CATEGORY)
  const beautyQuantity = beautyLines.reduce((sum, line) => sum + line.quantity, 0)

  let beautyDiscountCents = 0
  if (beautyQuantity >= BEAUTY_MIN_QUANTITY) {
    beautyDiscountCents = beautyLines.reduce((sum, line) => {
      const lineTotalCents = line.unitPriceCents * line.quantity
      return sum + roundHalfUp(lineTotalCents * BEAUTY_DISCOUNT_RATE)
    }, 0)

    if (beautyDiscountCents > 0) {
      discounts.push({
        id: 'BEAUTY_3',
        label: 'Beauty discount (-10%)',
        amountCents: beautyDiscountCents
      })
    }
  }

  const subtotalAfterBeautyCents = grossCents - beautyDiscountCents

  // --- Rule 2: TROYES10 promo code --------------------------------------
  let troyes10DiscountCents = 0
  if (promoCode !== undefined) {
    const normalizedCode = promoCode.trim().toUpperCase()

    if (normalizedCode === TROYES10_CODE) {
      if (subtotalAfterBeautyCents > TROYES10_MIN_SUBTOTAL_CENTS) {
        troyes10DiscountCents = TROYES10_DISCOUNT_CENTS
      } else {
        messages.push(
          `Code ${TROYES10_CODE} rejected: the subtotal after discount must exceed €50.00 ` +
            `(current: €${centsToEuros(subtotalAfterBeautyCents)}).`
        )
      }
    } else if (normalizedCode.length > 0) {
      messages.push(`Unknown promo code "${promoCode.trim()}".`)
    }
  }

  // --- Rule 3: cap at 25% of the gross subtotal --------------------------
  let totalDiscountCents = beautyDiscountCents + troyes10DiscountCents
  const capCents = roundHalfUp(grossCents * DISCOUNT_CAP_RATE)

  if (totalDiscountCents > capCents) {
    const excessCents = totalDiscountCents - capCents
    const reducedTroyes10Cents = Math.max(0, troyes10DiscountCents - excessCents)

    if (troyes10DiscountCents > 0) {
      messages.push(
        `The promo code was reduced by €${centsToEuros(excessCents)} to respect ` +
          'the 25% discount cap.'
      )
    }

    troyes10DiscountCents = reducedTroyes10Cents
    totalDiscountCents = beautyDiscountCents + troyes10DiscountCents
  }

  if (troyes10DiscountCents > 0) {
    discounts.push({
      id: 'TROYES10',
      label: `Code ${TROYES10_CODE}`,
      amountCents: troyes10DiscountCents
    })
  }

  // --- Rule 4: shipping ---------------------------------------------------
  const amountAfterDiscountsCents = grossCents - totalDiscountCents
  const hasFurniture = lines.some((line) => line.category === FURNITURE_CATEGORY)
  const shippingCents =
    !hasFurniture && amountAfterDiscountsCents >= FREE_SHIPPING_THRESHOLD_CENTS
      ? 0
      : SHIPPING_CENTS

  const totalCents = amountAfterDiscountsCents + shippingCents

  return {
    grossCents,
    discounts,
    shippingCents,
    totalCents,
    messages
  }
}