<template>
  <div class="add-to-cart">
    <div class="add-to-cart__row">
      <label class="add-to-cart__label" :for="`add-qty-${product.id}`">Quantité</label>
      <input
        :id="`add-qty-${product.id}`"
        v-model.number="qty"
        class="add-to-cart__qty"
        type="number"
        min="1"
        :max="product.stock"
        :disabled="product.stock === 0"
      >
    </div>
    <button
      type="button"
      class="btn btn--block add-to-cart__btn"
      :disabled="product.stock === 0 || qty < 1"
      @click="addToCart"
    >
      {{ product.stock === 0 ? 'Rupture de stock' : 'Ajouter au panier' }}
    </button>
    <p v-if="added" class="add-to-cart__status" role="status">✓ Ajouté au panier.</p>
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

<style scoped>
.add-to-cart {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.add-to-cart__row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.add-to-cart__label {
  font-weight: 600;
  font-size: 0.92rem;
}

.add-to-cart__qty {
  width: 80px;
  text-align: center;
  padding: 0.6rem 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  background: var(--color-surface);
}

.add-to-cart__btn {
  font-size: 1rem;
  padding-block: 0.85rem;
}

.add-to-cart__status {
  margin: 0;
  color: var(--color-success);
  font-weight: 600;
  font-size: 0.9rem;
}
</style>
