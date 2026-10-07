<script setup lang="ts">
import type { Product } from '~/types/dummyjson'

const props = defineProps<{
  product: Product
}>()

const hasDiscount = computed(() => props.product.discountPercentage > 0)

const formattedPrice = computed(() =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(props.product.price)
)
</script>

<template>
  <NuxtLink :to="`/products/${product.id}`" class="product-card">
    <div class="product-card__image-wrapper">
      <img
        :src="product.thumbnail"
        :alt="product.title"
        class="product-card__image"
        loading="lazy"
      />
      <span v-if="hasDiscount" class="product-card__badge">
        −{{ Math.round(product.discountPercentage) }}%
      </span>
    </div>

    <div class="product-card__content">
      <h3 class="product-card__title">{{ product.title }}</h3>
      <p class="product-card__price">{{ formattedPrice }}</p>
      <div class="product-card__rating">
        <span aria-hidden="true">★</span>
        <span>{{ product.rating.toFixed(1) }}</span>
      </div>
    </div>
  </NuxtLink>
</template>

<style scoped>
.product-card {
  display: block;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  transition: box-shadow 0.2s ease;
}

.product-card:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.product-card__image-wrapper {
  position: relative;
  aspect-ratio: 1 / 1;
  background: #f5f5f5;
}

.product-card__image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.product-card__badge {
  position: absolute;
  top: 8px;
  left: 8px;
  background: #d32f2f;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
}

.product-card__content {
  padding: 12px;
}

.product-card__title {
  font-size: 0.95rem;
  font-weight: 500;
  margin: 0 0 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-card__price {
  font-weight: 700;
  margin: 0 0 4px;
}

.product-card__rating {
  font-size: 0.85rem;
  color: #666;
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>