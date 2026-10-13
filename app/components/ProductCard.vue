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
  display: flex;
  flex-direction: column;
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

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
  border-color: var(--rose-200);
  text-decoration: none;
}

.product-card__image-wrapper {
  position: relative;
  aspect-ratio: 1 / 1;
  background: var(--color-bg-soft);
  padding: 10px;
}

.product-card__image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  mix-blend-mode: multiply;
}

.product-card__badge {
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

.product-card__content {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 14px 16px 16px;
}

.product-card__title {
  font-size: 0.95rem;
  font-weight: 500;
  margin: 0;
  color: var(--color-text);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 2.6em;
}

.product-card__price {
  font-weight: 700;
  font-size: 1.05rem;
  color: var(--color-text);
  margin: 0;
}

.product-card__rating {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  gap: 4px;
}

.product-card__rating span[aria-hidden='true'] {
  color: var(--color-star);
}
</style>