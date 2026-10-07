<template>
  <li class="cart-line">
    <img
      v-if="item.snapshot?.thumbnail"
      :src="item.snapshot.thumbnail"
      :alt="item.snapshot.title"
      width="80"
      height="80"
      loading="lazy"
    >
    <div>
      <p>{{ item.snapshot?.title ?? `Product #${item.productId}` }}</p>
      <p v-if="item.snapshot">{{ formatCents(eurosToCents(item.snapshot.price)) }} each</p>
      <p v-else>Loading price…</p>
    </div>
    <div>
      <label :for="`qty-${item.productId}`">Quantity</label>
      <button type="button" :aria-label="`Decrease quantity for product ${item.productId}`" @click="decrease">−</button>
      <input
        :id="`qty-${item.productId}`"
        type="number"
        min="0"
        :max="item.snapshot?.stock ?? 99"
        :value="item.qty"
        @change="onQty(($event.target as HTMLInputElement).valueAsNumber)"
      >
      <button type="button" :aria-label="`Increase quantity for product ${item.productId}`" @click="increase">+</button>
      <button type="button" @click="cart.remove(item.productId)">Remove</button>
    </div>
  </li>
</template>

<script setup lang="ts">
import { useCartStore } from '../../stores/cart'
import { eurosToCents, formatCents } from '../../utils/money'
import type { HydratedItem } from '../../stores/cart'

const props = defineProps<{
  item: HydratedItem
}>()

const cart = useCartStore()

function decrease(): void {
  cart.setQty(props.item.productId, props.item.qty - 1)
}

function increase(): void {
  cart.setQty(props.item.productId, props.item.qty + 1)
}

function onQty(value: number): void {
  cart.setQty(props.item.productId, Number.isNaN(value) ? 0 : value)
}
</script>
