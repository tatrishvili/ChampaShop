<script setup lang="ts">
// URL-driven value: writes ?search=… to the query after 300 ms of inactivity
// (and resets page). useProducts watches route.query and refetches.
// Also clears ?category=: search and category are mutually exclusive.
const search = useDebouncedQuery('search', 300, ['category'])
</script>

<template>
  <div class="product-search">
    <input
      v-model="search"
      type="search"
      class="product-search__input"
      placeholder="Rechercher un produit…"
      aria-label="Rechercher un produit"
    >
  </div>
</template>

<style scoped>
.product-search {
  flex: 1 1 240px;
  min-width: 200px;
}

.product-search__input {
  width: 100%;
  padding: 0.7rem 1rem 0.7rem 2.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  font-size: 0.95rem;
  background-color: var(--color-surface);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='%23b5335f' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cpath d='m21 21-4.3-4.3'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: 0.85rem center;
  background-size: 18px 18px;
}
</style>
