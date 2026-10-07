import type { ComputedRef } from "vue";

// Products shown per page. Single definition, shared by the data layer
// (useProducts) and the page (totalPages computation).
export const PER_PAGE = 12;

// The whole catalog view is described by the URL query string. This is the
// single source of truth for READING that state back, used both during SSR
// (first paint, so a reload or a shared link is rendered server-side with the
// right view) and on the client (browser back/forward). Every value is parsed
// defensively: a malformed param (?page=abc, ?minPrice=-5) must never break the
// request, it falls back to a safe default instead.
export interface ProductQuery {
  page: number;
  search: string;
  category: string;
  sortBy: string;
  order: string;
  minPrice: number | null;
  maxPrice: number | null;
}

// A page is a positive integer; anything else (NaN, 0, -3, 2.5, "abc") -> 1.
function toPage(value: unknown): number {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 ? n : 1;
}

// A price bound is a finite number >= 0; absent or invalid -> null (no bound).
function toPrice(value: unknown): number | null {
  if (value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function toText(value: unknown): string {
  return value ? String(value) : "";
}

export function useProductQuery(): ComputedRef<ProductQuery> {
  const route = useRoute();
  return computed(() => ({
    page: toPage(route.query.page),
    search: toText(route.query.search),
    category: toText(route.query.category),
    sortBy: toText(route.query.sortBy),
    order: toText(route.query.order),
    minPrice: toPrice(route.query.minPrice),
    maxPrice: toPrice(route.query.maxPrice),
  }));
}
