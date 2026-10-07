<template>
  <div>
    <h1>Cart</h1>

    <p v-if="cart.lastError" role="alert">{{ cart.lastError }}</p>

    <p v-if="cart.isEmpty">Your cart is empty.</p>

    <template v-else>
      <p v-if="hydrateError">Some product details could not be loaded. <button type="button" @click="refresh()">Retry</button></p>

      <ul>
        <CartLine v-for="item in cart.items" :key="item.productId" :item="item" />
      </ul>

      <form @submit.prevent="applyCode">
        <label for="promo">Promo code</label>
        <input id="promo" v-model="code" type="text" autocomplete="off">
        <button type="submit">Apply</button>
      </form>

      <CartSummary :summary="cart.summary" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useCartStore } from '../stores/cart'
import type { CartProductSnapshot, Product } from '../types/dummyjson'
import CartLine from '../components/cart/CartLine.vue'
import CartSummary from '../components/cart/CartSummary.vue'

const cart = useCartStore()
const code = ref<string>(cart.promoCode)
const hydrateError = ref<boolean>(false)

async function hydrate(): Promise<void> {
  hydrateError.value = false
  try {
    const ids = cart.items.map((i) => i.productId)
    const snapshots: CartProductSnapshot[] = []
    for (const id of ids) {
      const product = await $fetch<Product>(`https://dummyjson.com/products/${id}`)
      snapshots.push({
        id: product.id,
        title: product.title,
        price: product.price,
        category: product.category,
        stock: product.stock,
        thumbnail: product.thumbnail
      })
    }
    cart.registerProducts(snapshots)
  } catch {
    hydrateError.value = true
  }
}

function applyCode(): void {
  cart.applyPromo(code.value)
}

async function refresh(): Promise<void> {
  await hydrate()
}

watch(
  () => cart.items.length,
  () => {
    void hydrate()
  }
)

await hydrate()

useSeoMeta({
  title: 'Cart — ChampaShop',
  description: 'Review your ChampaShop cart, apply a promo code and check the total.'
})
</script>
