<script setup lang="ts">
import { useRecentlyViewedProducts } from '../../composables/useRecentlyViewedProducts'
import { useRecentlyViewedStore } from '../../stores/recently-viewed'

const props = defineProps<{
  /** Product to hide — the one the current page is about. */
  excludeId?: number
}>()

const store = useRecentlyViewedStore()
const { products } = useRecentlyViewedProducts({
  excludeId: () => props.excludeId
})

// Show the section only when at least one *other* id exists in the history:
// a first-time visit (history = current product only) stays silent, while
// zombie ids (deleted products) still reveal the heading + clear button.
const visibleCount = computed<number>(() => {
  if (props.excludeId === undefined) return store.ids.length
  return store.ids.filter((id) => id !== props.excludeId).length
})

function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price)
}
</script>

<template>
  <section
    v-if="visibleCount > 0"
    aria-labelledby="recently-viewed-heading"
    class="recently-viewed"
  >
    <div class="recently-viewed__header">
      <h2 id="recently-viewed-heading">Vus récemment</h2>
      <button type="button" class="recently-viewed__clear" @click="store.clear()">
        Effacer l'historique
      </button>
    </div>

    <!-- ids may outlive their products (deleted ids): keep the heading and
         the clear button, just render no card. -->
    <ul v-if="products && products.length > 0" class="recently-viewed__list">
      <li v-for="product in products" :key="product.id" class="recently-viewed__item">
        <NuxtLink :to="`/products/${product.id}`" class="recently-viewed__card">
          <img
            :src="product.thumbnail"
            :alt="product.title"
            class="recently-viewed__image"
            loading="lazy"
          >
          <span v-if="product.discountPercentage > 0" class="recently-viewed__badge">
            −{{ Math.round(product.discountPercentage) }}%
          </span>
          <span class="recently-viewed__title">{{ product.title }}</span>
          <span class="recently-viewed__price">{{ formatPrice(product.price) }}</span>
        </NuxtLink>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.recently-viewed {
  margin-top: 2rem;
}

.recently-viewed__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.recently-viewed__header h2 {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.35rem;
}

.recently-viewed__clear {
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  border-radius: var(--radius-pill);
  padding: 6px 14px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: border-color 0.2s ease, color 0.2s ease;
}

.recently-viewed__clear:hover {
  border-color: var(--color-primary);
  color: var(--color-primary-strong);
}

.recently-viewed__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 1rem;
}

.recently-viewed__card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: var(--color-surface);
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-md);
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  box-shadow: var(--shadow-sm);
  transition: box-shadow 0.22s ease, transform 0.22s ease,
    border-color 0.22s ease;
}

.recently-viewed__card:hover,
.recently-viewed__card:focus-visible {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
  border-color: var(--rose-200);
}

.recently-viewed__image {
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: contain;
  background: var(--color-bg-soft);
  padding: 10px;
  mix-blend-mode: multiply;
}

.recently-viewed__badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background: var(--color-primary);
  color: #fff;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.2rem 0.55rem;
  border-radius: var(--radius-pill);
  box-shadow: var(--shadow-sm);
}

.recently-viewed__title {
  padding: 8px 12px 0;
  font-size: 0.9rem;
  color: var(--color-text);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.recently-viewed__price {
  padding: 0 12px 12px;
  font-weight: 700;
  color: var(--color-text);
}
</style>
