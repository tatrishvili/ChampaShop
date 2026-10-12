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

function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price)
}
</script>

<template>
  <section
    v-if="store.ids.length > 0"
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
          />
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
  font-size: 1.25rem;
}

.recently-viewed__clear {
  border: 1px solid #ccc;
  background: #fff;
  border-radius: 6px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 0.875rem;
}

.recently-viewed__clear:hover {
  background: #f5f5f5;
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
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  transition: box-shadow 0.2s ease;
}

.recently-viewed__card:hover,
.recently-viewed__card:focus-visible {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.recently-viewed__image {
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: contain;
  background: #f5f5f5;
}

.recently-viewed__badge {
  position: absolute;
  top: 8px;
  left: 8px;
  background: #d32f2f;
  color: #fff;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
}

.recently-viewed__title {
  padding: 8px 12px 0;
  font-size: 0.9rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.recently-viewed__price {
  padding: 0 12px 12px;
  font-weight: 700;
}
</style>
