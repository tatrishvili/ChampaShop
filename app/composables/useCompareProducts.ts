import type { Product } from '~/types/dummyjson'

export interface UseCompareProductsOptions {
  /**
   * `select` projection to shrink the payload (e.g. the bar only needs
   * `id,title,thumbnail`). Omit to fetch the full product, which the
   * comparison table needs (dimensions, warranty, shipping…).
   */
  select?: string
}

/**
 * Resolve a list of comparator ids into products (F6).
 *
 * Strategy (same as recently-viewed): DummyJSON has no "fetch many by ids"
 * endpoint, so we issue one request per id in parallel through
 * `Promise.allSettled`. A failed/deleted id (404, network error) is simply
 * dropped — the other products still render — and the fulfilled results keep
 * the input order, which is the order the URL / cookie listed them.
 *
 * The `useAsyncData` key is reactive (a function of the ids + the projection):
 * SSR and client hydrate the same key with no flash, and changing the
 * selection triggers a fresh fetch.
 */
export function useCompareProducts(
  ids: () => number[],
  options: UseCompareProductsOptions = {}
) {
  const { select } = options

  const { data, pending, error, refresh } = useAsyncData<Product[]>(
    () => `compare:${select ?? 'full'}:${ids().join(',')}`,
    async () => {
      const list = ids()
      if (list.length === 0) return []

      const results = await Promise.allSettled(
        list.map((id) =>
          $fetch<Product>(`https://dummyjson.com/products/${id}`, {
            query: select ? { select } : undefined
          })
        )
      )

      return results.flatMap((result) =>
        result.status === 'fulfilled' ? [result.value] : []
      )
    }
  )

  return { products: data, pending, error, refresh }
}
