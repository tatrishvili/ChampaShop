<template>
  <li class="cart-line">
    <div class="cart-line__media">
      <img
        v-if="item.snapshot?.thumbnail"
        :src="item.snapshot.thumbnail"
        :alt="item.snapshot.title"
        width="80"
        height="80"
        loading="lazy"
        class="cart-line__img"
      >
    </div>

    <div class="cart-line__info">
      <p class="cart-line__title">{{ item.snapshot?.title ?? `Produit #${item.productId}` }}</p>
      <p v-if="item.snapshot" class="cart-line__price">
        {{ formatCents(eurosToCents(item.snapshot.price)) }} <span class="cart-line__unit">/ unité</span>
      </p>
      <p v-else class="cart-line__price muted">Chargement du prix…</p>

      <button type="button" class="cart-line__remove" @click="cart.remove(item.productId)">
        Supprimer
      </button>
    </div>

    <div class="cart-line__qty">
      <label class="sr-only" :for="`qty-${item.productId}`">Quantité</label>
      <div class="stepper">
        <button
          type="button"
          class="stepper__btn"
          :aria-label="`Diminuer la quantité du produit ${item.productId}`"
          @click="decrease"
        >−</button>
        <input
          :id="`qty-${item.productId}`"
          class="stepper__input"
          type="number"
          min="0"
          :max="item.snapshot?.stock ?? 99"
          :value="item.qty"
          @change="onQty(($event.target as HTMLInputElement).valueAsNumber)"
        >
        <button
          type="button"
          class="stepper__btn"
          :aria-label="`Augmenter la quantité du produit ${item.productId}`"
          @click="increase"
        >+</button>
      </div>
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

<style scoped>
.cart-line {
  display: grid;
  grid-template-columns: 88px 1fr auto;
  gap: 1rem;
  align-items: center;
  padding: 1rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}

.cart-line__media {
  width: 88px;
  height: 88px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.4rem;
  background: var(--color-bg-soft);
  border-radius: var(--radius-sm);
}
.cart-line__img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  mix-blend-mode: multiply;
}

.cart-line__info {
  min-width: 0;
}
.cart-line__title {
  margin: 0 0 0.25rem;
  font-weight: 600;
  font-size: 0.98rem;
  color: var(--color-text);
}
.cart-line__price {
  margin: 0 0 0.5rem;
  font-weight: 600;
  color: var(--color-text);
}
.cart-line__unit {
  font-weight: 400;
  font-size: 0.82rem;
  color: var(--color-text-muted);
}
.cart-line__remove {
  padding: 0;
  border: none;
  background: none;
  color: var(--color-text-muted);
  font-size: 0.82rem;
  text-decoration: underline;
  cursor: pointer;
}
.cart-line__remove:hover {
  color: var(--color-primary-strong);
}

/* Quantity stepper */
.stepper {
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  overflow: hidden;
  background: var(--color-surface);
}
.stepper__btn {
  width: 36px;
  height: 36px;
  border: none;
  background: none;
  color: var(--color-primary-strong);
  font-size: 1.15rem;
  line-height: 1;
  cursor: pointer;
  transition: background 0.15s ease;
}
.stepper__btn:hover {
  background: var(--color-primary-soft);
}
.stepper__input {
  width: 44px;
  height: 36px;
  padding: 0;
  text-align: center;
  border: none;
  border-left: 1px solid var(--color-border);
  border-right: 1px solid var(--color-border);
  border-radius: 0;
  background: var(--color-surface);
  -moz-appearance: textfield;
}
.stepper__input::-webkit-outer-spin-button,
.stepper__input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.stepper__input:focus {
  outline: none;
  box-shadow: none;
}

@media (max-width: 480px) {
  .cart-line {
    grid-template-columns: 72px 1fr;
    grid-template-areas:
      'media info'
      'qty qty';
    row-gap: 0.75rem;
  }
  .cart-line__media {
    grid-area: media;
    width: 72px;
    height: 72px;
  }
  .cart-line__info {
    grid-area: info;
  }
  .cart-line__qty {
    grid-area: qty;
  }
}
</style>
