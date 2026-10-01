import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { CartProductSnapshot } from '../types/dummyjson'
import { computeCart, type CartLine, type CartSummary } from '../utils/promotions'
import { eurosToCents } from '../utils/money'

interface PersistedItem {
  productId: number
  qty: number
}

interface PersistedCart {
  items: PersistedItem[]
  promoCode: string
}

export interface HydratedItem extends PersistedItem {
  snapshot: CartProductSnapshot | null
}

const COOKIE_KEY = 'champashop-cart'
const MAX_QTY_PER_LINE = 99

/**
 * Cart store (F3).
 * The cookie only stores `{ productId, qty }` + promo code so it stays
 * far below the 4 Ko limit. Product details (price/category/stock) are
 * hydrated at runtime via `registerProducts()` and never persisted.
 */
export const useCartStore = defineStore('cart', () => {
  const persisted = useCookie<PersistedCart>(COOKIE_KEY, {
    default: () => ({ items: [], promoCode: '' }),
    maxAge: 60 * 60 * 24 * 30,
    sameSite: 'lax'
  })

  const snapshots = ref<Record<number, CartProductSnapshot>>({})
  const lastError = ref<string | null>(null)

  function save(items: PersistedItem[], promoCode: string): void {
    persisted.value = { items, promoCode }
  }

  function registerProducts(products: CartProductSnapshot[]): void {
    for (const p of products) snapshots.value[p.id] = p
  }

  function clampQty(productId: number, wanted: number): number {
    const snapshot = snapshots.value[productId]
    const stock = snapshot?.stock ?? MAX_QTY_PER_LINE
    return Math.max(0, Math.min(wanted, stock, MAX_QTY_PER_LINE))
  }

  function add(product: CartProductSnapshot, qty = 1): void {
    lastError.value = null
    registerProducts([product])
    const items = [...persisted.value.items]
    const existing = items.find((i) => i.productId === product.id)
    const wanted = (existing?.qty ?? 0) + qty
    const allowed = clampQty(product.id, wanted)
    if (allowed < wanted) {
      lastError.value = `Only ${product.stock} in stock for "${product.title}". Quantity limited.`
    }
    if (existing) {
      existing.qty = allowed
    } else if (allowed > 0) {
      items.push({ productId: product.id, qty: allowed })
    }
    save(items.filter((i) => i.qty > 0), persisted.value.promoCode)
  }

  function remove(productId: number): void {
    lastError.value = null
    save(
      persisted.value.items.filter((i) => i.productId !== productId),
      persisted.value.promoCode
    )
  }

  function setQty(productId: number, qty: number): void {
    lastError.value = null
    if (qty <= 0) {
      remove(productId)
      return
    }
    const allowed = clampQty(productId, qty)
    if (allowed < qty) {
      const snapshot = snapshots.value[productId]
      lastError.value = snapshot
        ? `Only ${snapshot.stock} in stock for "${snapshot.title}". Quantity limited.`
        : `Quantity limited to ${allowed}.`
    }
    save(
      persisted.value.items.map((i) =>
        i.productId === productId ? { ...i, qty: allowed } : i
      ),
      persisted.value.promoCode
    )
  }

  function applyPromo(code: string): void {
    lastError.value = null
    save(persisted.value.items, code)
  }

  function clear(): void {
    lastError.value = null
    snapshots.value = {}
    save([], '')
  }

  const items = computed<HydratedItem[]>(() =>
    persisted.value.items.map((i) => ({
      ...i,
      snapshot: snapshots.value[i.productId] ?? null
    }))
  )

  const lines = computed<CartLine[]>(() =>
    items.value
      .filter((i) => i.snapshot !== null && i.qty > 0)
      .map((i) => ({
        productId: i.productId,
        category: (i.snapshot as CartProductSnapshot).category.toLowerCase(),
        unitPriceCents: eurosToCents((i.snapshot as CartProductSnapshot).price),
        quantity: i.qty
      }))
  )

  const summary = computed<CartSummary>(() =>
    computeCart(lines.value, persisted.value.promoCode || undefined)
  )

  const count = computed<number>(() =>
    persisted.value.items.reduce((sum, i) => sum + i.qty, 0)
  )

  const isEmpty = computed<boolean>(() => persisted.value.items.length === 0)

  return {
    items,
    lines,
    summary,
    count,
    isEmpty,
    lastError,
    promoCode: computed(() => persisted.value.promoCode),
    registerProducts,
    add,
    remove,
    setQty,
    applyPromo,
    clear
  }
})
