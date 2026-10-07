<template>
  <div>
    <label :for="`add-qty-${product.id}`">Quantity</label>
    <input
      :id="`add-qty-${product.id}`"
      v-model.number="qty"
      type="number"
      min="1"
      :max="product.stock"
      :disabled="product.stock === 0"
    >
    <button type="button" :disabled="product.stock === 0 || qty < 1" @click="addToCart">
      {{ product.stock === 0 ? 'Out of stock' : 'Add to cart' }}
    </button>
    <p v-if="added" role="status">Added to cart.</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useCartStore } from '../../stores/cart'
import type { CartProductSnapshot } from '../../types/dummyjson'

const props = defineProps<{
  product: CartProductSnapshot
}>()

const cart = useCartStore()
const qty = ref<number>(1)
const added = ref<boolean>(false)

function addToCart(): void {
  cart.add(props.product, qty.value)
  added.value = true
}
</script>
