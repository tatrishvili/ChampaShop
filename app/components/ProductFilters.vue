<script setup lang="ts">
import type { ProductsCategory } from '~/types/dummyjson'

const route = useRoute()
const router = useRouter()

const { data: categories } = useAsyncData('categories', () =>
  $fetch<ProductsCategory[]>('https://dummyjson.com/products/categories'),
)

// French labels for the English category slugs returned by the API.
const CATEGORY_LABELS: Record<string, string> = {
  beauty: 'Beauté',
  fragrances: 'Parfums',
  furniture: 'Mobilier',
  groceries: 'Épicerie',
  'home-decoration': 'Décoration maison',
  'kitchen-accessories': 'Accessoires de cuisine',
  laptops: 'Ordinateurs portables',
  'mens-shirts': 'Chemises homme',
  'mens-shoes': 'Chaussures homme',
  'mens-watches': 'Montres homme',
  'mobile-accessories': 'Accessoires mobiles',
  motorcycle: 'Moto',
  'skin-care': 'Soins de la peau',
  smartphones: 'Smartphones',
  'sports-accessories': 'Accessoires de sport',
  sunglasses: 'Lunettes de soleil',
  tablets: 'Tablettes',
  tops: 'Hauts',
  vehicle: 'Véhicules',
  'womens-bags': 'Sacs femme',
  'womens-dresses': 'Robes femme',
  'womens-jewellery': 'Bijoux femme',
  'womens-shoes': 'Chaussures femme',
  'womens-watches': 'Montres femme',
}

// Fall back to the API name if a slug is ever missing from the map.
function categoryLabel(slug: string, fallback: string) {
  return CATEGORY_LABELS[slug] ?? fallback
}

// Predefined sort options: each choice sets both sortBy and order.
const SORT_OPTIONS = [
  { value: '', label: 'Trier par…', sortBy: undefined, order: undefined },
  { value: 'price-asc', label: 'Prix croissant', sortBy: 'price', order: 'asc' },
  { value: 'price-desc', label: 'Prix décroissant', sortBy: 'price', order: 'desc' },
  { value: 'rating-desc', label: 'Mieux notés', sortBy: 'rating', order: 'desc' },
  { value: 'title-asc', label: 'Titre A→Z', sortBy: 'title', order: 'asc' },
  { value: 'title-desc', label: 'Titre Z→A', sortBy: 'title', order: 'desc' },
] as const

const currentCategory = computed(() => String(route.query.category ?? ''))

const currentSort = computed(() =>
  route.query.sortBy
    ? `${route.query.sortBy}-${route.query.order ?? 'asc'}`
    : '',
)

// Picking a category clears the search (mutual exclusivity). Sort is kept.
function onCategory(event: Event) {
  const slug = (event.target as HTMLSelectElement).value
  router.push({
    query: {
      ...route.query,
      category: slug || undefined,
      search: undefined,
      page: undefined,
    },
  })
}

// Sort is orthogonal: it touches neither the category nor the search.
function onSort(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  const option = SORT_OPTIONS.find((o) => o.value === value)
  router.push({
    query: {
      ...route.query,
      sortBy: option?.sortBy,
      order: option?.order,
      page: undefined,
    },
  })
}
</script>

<template>
  <div class="product-filters">
    <select
      class="product-filters__select"
      aria-label="Filtrer par catégorie"
      @change="onCategory"
    >
      <!-- :selected on the option (not :value on the select) so the current
           choice is marked server-side; a plain value attr on a <select> is
           ignored by HTML, which would leave SSR showing the first option. -->
      <option value="" :selected="currentCategory === ''">Toutes les catégories</option>
      <option
        v-for="c in categories"
        :key="c.slug"
        :value="c.slug"
        :selected="c.slug === currentCategory"
      >
        {{ categoryLabel(c.slug, c.name) }}
      </option>
    </select>

    <select
      class="product-filters__select"
      aria-label="Trier les produits"
      @change="onSort"
    >
      <option
        v-for="o in SORT_OPTIONS"
        :key="o.value"
        :value="o.value"
        :selected="o.value === currentSort"
      >
        {{ o.label }}
      </option>
    </select>
  </div>
</template>

<style scoped>
.product-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
}

.product-filters__select {
  padding: 10px 14px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  font-size: 0.95rem;
  background: #fff;
  cursor: pointer;
}

.product-filters__select:focus {
  outline: none;
  border-color: #111;
}
</style>
