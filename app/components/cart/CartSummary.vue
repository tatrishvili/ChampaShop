<template>
  <section class="summary" aria-label="Récapitulatif du panier">
    <h2 class="summary__title">Récapitulatif</h2>
    <dl class="summary__list">
      <div class="summary__row">
        <dt>Sous-total</dt>
        <dd>{{ formatCents(summary.grossCents) }}</dd>
      </div>
      <div
        v-for="discount in summary.discounts"
        :key="discount.id"
        class="summary__row summary__row--discount"
      >
        <dt>{{ discount.label }}</dt>
        <dd>−{{ formatCents(discount.amountCents) }}</dd>
      </div>
      <div class="summary__row">
        <dt>Livraison</dt>
        <dd>{{ summary.shippingCents === 0 ? 'Offerte' : formatCents(summary.shippingCents) }}</dd>
      </div>
      <div class="summary__row summary__row--total">
        <dt>Total</dt>
        <dd>{{ formatCents(summary.totalCents) }}</dd>
      </div>
    </dl>
    <ul v-if="summary.messages.length > 0" class="summary__messages" aria-live="polite">
      <li v-for="(message, index) in summary.messages" :key="index">{{ message }}</li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import type { CartSummary } from '../../utils/promotions'
import { formatCents } from '../../utils/money'

defineProps<{
  summary: CartSummary
}>()
</script>

<style scoped>
.summary {
  padding: 1.25rem 1.4rem 1.5rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}

.summary__title {
  margin: 0 0 1rem;
  font-size: 1.15rem;
}

.summary__list {
  margin: 0;
}

.summary__row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.5rem 0;
  color: var(--color-text);
}
.summary__row dt {
  color: var(--color-text-muted);
}
.summary__row dd {
  margin: 0;
  font-weight: 500;
}

.summary__row--discount dd {
  color: var(--color-primary-strong);
}

.summary__row--total {
  margin-top: 0.5rem;
  padding-top: 0.9rem;
  border-top: 1px solid var(--color-border-soft);
  font-size: 1.15rem;
}
.summary__row--total dt,
.summary__row--total dd {
  color: var(--color-text);
  font-weight: 700;
}

.summary__messages {
  margin: 1rem 0 0;
  padding: 0.75rem 1rem;
  list-style: none;
  background: var(--color-bg-soft);
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  color: var(--color-text-muted);
}
.summary__messages li + li {
  margin-top: 0.35rem;
}
</style>
