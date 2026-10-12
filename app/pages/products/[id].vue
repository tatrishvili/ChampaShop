<template>
  <div>
    <NuxtLink to="/products">Back to catalog</NuxtLink>

    <div v-if="pending" aria-busy="true">
      <div class="skeleton">Loading product…</div>
    </div>

    <div v-else-if="error">
      <p role="alert">Could not load this product.</p>
      <button type="button" @click="refresh()">Retry</button>
    </div>

    <article v-else-if="product">
      <h1>{{ product.title }}</h1>
      <p>{{ formatCents(eurosToCents(product.price)) }}</p>
      <p v-if="product.discountPercentage">Badge: {{ discountBadge(product.discountPercentage) }}</p>
      <p>Rating: {{ product.rating }} / 5</p>

      <ProductGallery :images="product.images" :title="product.title" />
      <StockBadge :stock="product.stock" />

      <p>{{ product.description }}</p>
      <dl>
        <div><dt>Brand</dt><dd>{{ product.brand }}</dd></div>
        <div><dt>Warranty</dt><dd>{{ product.warrantyInformation }}</dd></div>
        <div><dt>Shipping</dt><dd>{{ product.shippingInformation }}</dd></div>
      </dl>

      <AddToCart :product="snapshot" />

      <RecentlyViewedSection :exclude-id="product.id" />
    </article>
  </div>
</template>

<script setup lang="ts">
import ProductGallery from '../../components/product/ProductGallery.vue'
import StockBadge from '../../components/product/StockBadge.vue'
import AddToCart from '../../components/product/AddToCart.vue'
import RecentlyViewedSection from '../../components/recently-viewed/RecentlyViewedSection.vue'
import { useRecentlyViewedStore } from '../../stores/recently-viewed'
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

// Track the visit only for an existing product: on 404 / fetch error the
// handler throws, `product` stays null and nothing is recorded. `immediate`
// covers SSR, client hydration and a successful Retry after a failed load;
// revisits are deduplicated by pushRecentlyViewed.
const recentlyViewed = useRecentlyViewedStore()
watch(
  product,
  (value) => {
    if (value) recentlyViewed.record(value.id)
  },
  { immediate: true }
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
