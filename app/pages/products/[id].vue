<template>
  <div class="pdp container">
    <NuxtLink to="/products" class="pdp__back">
      <span aria-hidden="true">←</span> Retour au catalogue
    </NuxtLink>

    <div v-if="pending" class="pdp__state" aria-busy="true">
      <div class="pdp__spinner" aria-hidden="true" />
      <p>Chargement du produit…</p>
    </div>

    <div v-else-if="error" class="pdp__state" role="alert">
      <p class="pdp__state-title">Impossible de charger ce produit.</p>
      <button type="button" class="btn" @click="refresh()">Réessayer</button>
    </div>

    <article v-else-if="product" class="pdp__grid">
      <div class="pdp__media">
        <ProductGallery :images="product.images" :title="product.title" />
      </div>

      <div class="pdp__info">
        <p v-if="product.brand" class="pdp__brand">{{ product.brand }}</p>
        <h1 class="pdp__title">{{ product.title }}</h1>

        <div class="pdp__rating" aria-label="Note du produit">
          <span class="pdp__stars" aria-hidden="true">★</span>
          <span>{{ product.rating }} / 5</span>
        </div>

        <div class="pdp__price-row">
          <span class="pdp__price">{{ formatCents(eurosToCents(product.price)) }}</span>
          <span v-if="product.discountPercentage" class="pdp__discount">
            {{ discountBadge(product.discountPercentage) }}
          </span>
        </div>

        <StockBadge :stock="product.stock" />

        <p class="pdp__desc">{{ product.description }}</p>

        <div class="pdp__cart">
          <AddToCart :product="snapshot" />
        </div>

        <dl class="pdp__meta">
          <div class="pdp__meta-row">
            <dt>Marque</dt>
            <dd>{{ product.brand || '—' }}</dd>
          </div>
          <div class="pdp__meta-row">
            <dt>Garantie</dt>
            <dd>{{ product.warrantyInformation }}</dd>
          </div>
          <div class="pdp__meta-row">
            <dt>Livraison</dt>
            <dd>{{ product.shippingInformation }}</dd>
          </div>
        </dl>
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
import ProductGallery from '../../components/product/ProductGallery.vue'
import StockBadge from '../../components/product/StockBadge.vue'
import AddToCart from '../../components/product/AddToCart.vue'
import type { CartProductSnapshot, Product } from '../../types/dummyjson'
import { eurosToCents, formatCents, discountBadge } from '../../utils/money'

const route = useRoute()
const id = computed<string>(() => String(route.params.id))

const { data: product, pending, error, refresh } = await useAsyncData<Product>(
  () => `product-${id.value}`,
  async () => {
    try {
      return await $fetch<Product>(`https://dummyjson.com/products/${id.value}`)
    } catch (err: unknown) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'statusCode' in err &&
        (err as { statusCode?: number }).statusCode === 404
      ) {
        throw createError({ statusCode: 404, statusMessage: 'Product not found' })
      }
      throw err
    }
  }
)

const snapshot = computed<CartProductSnapshot>(() => ({
  id: product.value?.id ?? 0,
  title: product.value?.title ?? '',
  price: product.value?.price ?? 0,
  category: product.value?.category ?? '',
  stock: product.value?.stock ?? 0,
  thumbnail: product.value?.thumbnail ?? ''
}))

useSeoMeta({
  title: () => (product.value ? `${product.value.title} — ChampaShop` : 'Product — ChampaShop'),
  description: () => product.value?.description ?? 'Product details on ChampaShop.',
  ogTitle: () => (product.value ? `${product.value.title} — ChampaShop` : 'ChampaShop'),
  ogDescription: () => product.value?.description ?? '',
  ogImage: () => product.value?.thumbnail ?? ''
})
</script>

<style scoped>
.pdp {
  padding-block: 24px 48px;
}

.pdp__back {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 1.5rem;
  color: var(--color-text-muted);
  font-weight: 500;
  font-size: 0.92rem;
}
.pdp__back:hover {
  color: var(--color-primary-strong);
  text-decoration: none;
}

/* States */
.pdp__state {
  text-align: center;
  padding: 72px 16px;
  color: var(--color-text-muted);
}
.pdp__state-title {
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 1rem;
}
.pdp__spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 1rem;
  border: 3px solid var(--color-primary-soft);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: pdp-spin 0.8s linear infinite;
}
@keyframes pdp-spin {
  to {
    transform: rotate(360deg);
  }
}

/* Layout */
.pdp__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 48px;
  align-items: start;
}

.pdp__media {
  position: sticky;
  top: calc(var(--header-h) + 16px);
}

.pdp__info {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.pdp__brand {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-primary);
}

.pdp__title {
  font-family: var(--font-display);
  margin: 0;
}

.pdp__rating {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--color-text-muted);
  font-size: 0.95rem;
}
.pdp__stars {
  color: var(--color-star);
}

.pdp__price-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0.25rem 0 0.5rem;
}
.pdp__price {
  font-size: 1.9rem;
  font-weight: 700;
  color: var(--color-text);
}
.pdp__discount {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.7rem;
  border-radius: var(--radius-pill);
  background: var(--color-primary-soft);
  color: var(--color-primary-strong);
  font-size: 0.8rem;
  font-weight: 700;
}

.pdp__desc {
  margin: 0.5rem 0;
  color: var(--color-text-muted);
  line-height: 1.7;
}

.pdp__cart {
  margin: 0.5rem 0 1rem;
  padding: 1.25rem;
  background: var(--color-bg-soft);
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-lg);
}

.pdp__meta {
  margin: 0;
  border-top: 1px solid var(--color-border-soft);
}
.pdp__meta-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.85rem 0;
  border-bottom: 1px solid var(--color-border-soft);
}
.pdp__meta dt {
  color: var(--color-text-muted);
  font-size: 0.9rem;
}
.pdp__meta dd {
  margin: 0;
  text-align: right;
  font-weight: 500;
  font-size: 0.9rem;
}

@media (max-width: 860px) {
  .pdp__grid {
    grid-template-columns: 1fr;
    gap: 28px;
  }
  .pdp__media {
    position: static;
  }
  .pdp__price {
    font-size: 1.6rem;
  }
}
</style>
