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
  margin-bottom: 20px;
}

.product-search__input {
  width: 100%;
  max-width: 420px;
  padding: 10px 14px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  font-size: 0.95rem;
}

.product-search__input:focus {
  outline: none;
  border-color: #111;
}
</style>
