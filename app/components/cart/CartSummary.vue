<template>
  <section aria-label="Cart summary">
    <h2>Summary</h2>
    <dl>
      <div>
        <dt>Subtotal</dt>
        <dd>{{ formatCents(summary.grossCents) }}</dd>
      </div>
      <div v-for="discount in summary.discounts" :key="discount.id">
        <dt>{{ discount.label }}</dt>
        <dd>−{{ formatCents(discount.amountCents) }}</dd>
      </div>
      <div>
        <dt>Shipping</dt>
        <dd>{{ summary.shippingCents === 0 ? 'Free' : formatCents(summary.shippingCents) }}</dd>
      </div>
      <div>
        <dt>Total</dt>
        <dd>{{ formatCents(summary.totalCents) }}</dd>
      </div>
    </dl>
    <ul v-if="summary.messages.length > 0" aria-live="polite">
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
