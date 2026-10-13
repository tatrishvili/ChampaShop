<template>
  <p v-if="stock === 0" role="status" class="stock stock--out">
    <span class="stock__dot" aria-hidden="true" /> Rupture de stock
  </p>
  <p v-else-if="stock < 5" role="status" class="stock stock--low">
    <span class="stock__dot" aria-hidden="true" /> Plus que {{ stock }} en stock
  </p>
  <p v-else class="stock stock--ok">
    <span class="stock__dot" aria-hidden="true" /> En stock
  </p>
</template>

<script setup lang="ts">
defineProps<{
  stock: number
}>()
</script>

<style scoped>
.stock {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  margin: 0;
  padding: 0.3rem 0.75rem;
  border-radius: var(--radius-pill);
  font-size: 0.82rem;
  font-weight: 600;
}
.stock__dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: currentColor;
}
.stock--ok {
  color: var(--color-success);
  background: var(--color-success-soft);
}
.stock--low {
  color: #b5651d;
  background: #fbeede;
}
.stock--out {
  color: var(--color-primary-strong);
  background: var(--color-primary-soft);
}
</style>
