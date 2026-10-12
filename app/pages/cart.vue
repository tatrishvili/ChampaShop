<template>
  <div class="cart container">
    <h1 class="cart__title">Mon panier</h1>

    <p v-if="cart.lastError" class="cart__alert" role="alert">{{ cart.lastError }}</p>

    <div v-if="cart.isEmpty" class="cart__empty">
      <p class="cart__empty-icon" aria-hidden="true">🛍</p>
      <p class="cart__empty-text">Votre panier est vide.</p>
      <NuxtLink to="/products" class="btn">Découvrir le catalogue</NuxtLink>
    </div>

    <div v-else class="cart__grid">
      <div class="cart__items">
        <p v-if="hydrateError" class="cart__notice">
          Certains détails produits n'ont pas pu être chargés.
          <button type="button" class="cart__retry" @click="refresh()">Réessayer</button>
        </p>

        <ul class="cart__list">
          <CartLine v-for="item in cart.items" :key="item.productId" :item="item" />
        </ul>
      </div>

      <aside class="cart__aside">
        <form class="promo" @submit.prevent="applyCode">
          <label class="promo__label" for="promo">Code promo</label>
          <div class="promo__row">
            <input id="promo" v-model="code" class="promo__input" type="text" autocomplete="off" placeholder="Entrez votre code">
            <button type="submit" class="btn btn--ghost promo__btn">Appliquer</button>
          </div>
        </form>

        <CartSummary :summary="cart.summary" />
      </aside>
    </div>
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

<style scoped>
.cart {
  padding-block: 32px 48px;
}

.cart__title {
  font-family: var(--font-display);
  margin: 0 0 1.5rem;
}

.cart__alert {
  padding: 0.85rem 1.1rem;
  margin-bottom: 1.25rem;
  background: var(--color-primary-soft);
  color: var(--color-primary-strong);
  border-radius: var(--radius-sm);
  font-weight: 500;
}

/* Empty state */
.cart__empty {
  text-align: center;
  padding: 72px 16px;
}
.cart__empty-icon {
  font-size: 3rem;
  margin: 0 0 0.5rem;
}
.cart__empty-text {
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 1.25rem;
}

/* Layout */
.cart__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 32px;
  align-items: start;
}

.cart__notice {
  padding: 0.85rem 1.1rem;
  margin-bottom: 1rem;
  background: #fbeede;
  color: #8a5316;
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
}
.cart__retry {
  margin-left: 0.5rem;
  padding: 0.3rem 0.8rem;
  border: 1px solid currentColor;
  border-radius: var(--radius-pill);
  background: transparent;
  color: inherit;
  font-weight: 600;
  font-size: 0.82rem;
  cursor: pointer;
}

.cart__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

/* Summary column */
.cart__aside {
  position: sticky;
  top: calc(var(--header-h) + 16px);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.promo {
  padding: 1.1rem 1.25rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}
.promo__label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  font-size: 0.9rem;
}
.promo__row {
  display: flex;
  gap: 0.5rem;
}
.promo__input {
  flex: 1 1 auto;
  min-width: 0;
  border-radius: var(--radius-pill);
}
.promo__btn {
  flex: 0 0 auto;
  padding-inline: 1.1rem;
}

@media (max-width: 780px) {
  .cart__grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  .cart__aside {
    position: static;
  }
}
</style>
