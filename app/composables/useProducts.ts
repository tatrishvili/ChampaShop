import type { ProductsResponse } from "~/types/dummyjson";

export function useProducts() {
  const route = useRoute();
  // Read the whole view state from the URL (single source of truth, parsed
  // defensively). Reading the same computed on the server and the client is what
  // makes a reload / shared link reproduce the exact same request.
  const query = useProductQuery();

  // Race guard: useAsyncData keeps a reference to the latest promise launched for
  // this key ("products"). When route.query changes (fast typing), a new call
  // replaces the current promise; when an older call resolves, Nuxt sees it is no
  // longer the active promise and discards its result.
  // => an old response never overwrites a newer one (last-call-wins).
  const { data, pending, error, refresh } = useAsyncData(
    "products",
    async () => {
      const { page, search, category, sortBy, order, minPrice, maxPrice } =
        query.value;
      const hasPriceFilter = minPrice !== null || maxPrice !== null;

      // Neither title-only search nor price filtering exists server-side, and both
      // can be active at once. Either one forces the same shape: fetch the whole
      // relevant set (limit=0), filter it, then paginate client-side. Without a
      // client filter we keep the cheaper server pagination (limit + skip).
      const needsClientFilter = Boolean(search) || hasPriceFilter;

      // Sort is understood natively by every endpoint, even with limit=0, so the
      // server hands back an already-sorted set we only have to slice afterwards.
      const sortParams = new URLSearchParams();
      if (sortBy) sortParams.set("sortBy", sortBy);
      if (order) sortParams.set("order", order);

      if (needsClientFilter) {
        // Pick the broadest endpoint that still narrows the set server-side.
        // search and category are mutually exclusive (enforced in the UI).
        const params = new URLSearchParams(sortParams);
        params.set("limit", "0");

        let url: string;
        if (search) {
          params.set("q", search);
          url = `https://dummyjson.com/products/search?${params}`;
        } else {
          const endpoint = category
            ? `/products/category/${category}`
            : "/products";
          url = `https://dummyjson.com${endpoint}?${params}`;
        }

        const res = await $fetch<ProductsResponse>(url);

        let matches = res.products;
        if (search) {
          // dummyjson's /search also matches description and tags (e.g.
          // "headphones" contains "phone"); keep title substring matches only.
          const needle = search.toLowerCase();
          matches = matches.filter((p) => p.title.toLowerCase().includes(needle));
        }
        if (hasPriceFilter) {
          matches = matches.filter(
            (p) =>
              (minPrice === null || p.price >= minPrice) &&
              (maxPrice === null || p.price <= maxPrice),
          );
        }

        const start = (page - 1) * PER_PAGE;
        return {
          products: matches.slice(start, start + PER_PAGE),
          total: matches.length,
          skip: start,
          limit: PER_PAGE,
        } satisfies ProductsResponse;
      }

      // Normal list: server-side pagination (limit + skip).
      const params = new URLSearchParams(sortParams);
      params.set("limit", String(PER_PAGE));
      params.set("skip", String((page - 1) * PER_PAGE));

      const endpoint = category
        ? `/products/category/${category}`
        : "/products";

      return await $fetch<ProductsResponse>(
        `https://dummyjson.com${endpoint}?${params}`,
      );
    },
    { watch: [() => route.query] },
  );

  return { data, pending, error, refresh };
}
