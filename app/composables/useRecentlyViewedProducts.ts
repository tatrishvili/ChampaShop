import type { Product } from '~/types/dummyjson'
import { useRecentlyViewedStore } from '~/stores/recently-viewed'

/**
 * Fields the recently-viewed cards actually render. DummyJSON has no
 * "fetch many by ids" endpoint, so we issue one request per id with
 * `select` to keep payloads to a few hundred bytes each.
 */
const SELECT_FIELDS = 'id,title,price,thumbnail,rating,stock,discountPercentage'

export interface UseRecentlyViewedProductsOptions {
  /** Product to hide (the page currently being viewed). */
  excludeId?: () => number | undefined
}

/**
 * Resolve the recently viewed ids into product cards.
 *
 * Strategy (justified in the PR): parallel requests, one per id, with a
 * `select` projection — DummyJSON exposes no multi-id endpoint. Requests go
 * through `Promise.allSettled`, so a dead/deleted id (404) is simply dropped
 * instead of breaking the section, and the fulfilled results keep the input
 * order = recency order.
 *
 * The `useAsyncData` key is reactive (function of the visible ids): SSR
 * renders the same key the client hydrates (no flash), a `clear()` or a new
 * visit changes the key and triggers a fresh fetch, and two different views
 * (home vs product page exclusion) never share cached data.
 */
export function useRecentlyViewedProducts(options: UseRecentlyViewedProductsOptions = {}) {
  const store = useRecentlyViewedStore()

  const ids = computed<number[]>(() => {
    const excludeId = options.excludeId?.()
    if (excludeId === undefined) return store.ids
    return store.ids.filter((id) => id !== excludeId)
  })

  const { data, pending, error, refresh } = useAsyncData<Product[]>(
    () => `recently-viewed:${ids.value.join(',')}`,
    async () => {
      if (ids.value.length === 0) return []

      const results = await Promise.allSettled(
        ids.value.map((id) =>
          $fetch<Product>(`https://dummyjson.com/products/${id}`, {
            query: { select: SELECT_FIELDS }
          })
        )
      )

      return results.flatMap((result) => (result.status === 'fulfilled' ? [result.value] : []))
    }
  )

  return { products: data, pending, error, refresh }
}
