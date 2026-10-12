<script setup lang="ts">
// Price range is applied client-side (the API offers no price filter), so these
// two inputs only drive the URL (minPrice / maxPrice); useProducts reads them.
// Debounced like the search box so typing a number does not fire one request per
// keystroke. Price composes with category and search, hence no clearKeys: it
// clears nothing but page (useDebouncedQuery always resets page).
const minPrice = useDebouncedQuery('minPrice')
const maxPrice = useDebouncedQuery('maxPrice')
</script>

<template>
  <div class="price-filter">
    <label class="price-filter__field">
      <span class="price-filter__label">Prix min</span>
      <input
        v-model="minPrice"
        type="number"
        min="0"
        step="1"
        inputmode="numeric"
        placeholder="0"
        class="price-filter__input"
        aria-label="Prix minimum"
      >
    </label>
    <span class="price-filter__sep" aria-hidden="true">–</span>
    <label class="price-filter__field">
      <span class="price-filter__label">Prix max</span>
      <input
        v-model="maxPrice"
        type="number"
        min="0"
        step="1"
        inputmode="numeric"
        placeholder="∞"
        class="price-filter__input"
        aria-label="Prix maximum"
      >
    </label>
  </div>
</template>

<style scoped>
.price-filter {
  display: flex;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 10px;
}

.price-filter__field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.price-filter__label {
  font-size: 0.78rem;
  font-weight: 500;
  color: var(--color-text-muted);
  padding-left: 0.2rem;
}

.price-filter__input {
  width: 110px;
  padding: 0.7rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  font-size: 0.95rem;
  background: var(--color-surface);
}

.price-filter__sep {
  padding-bottom: 0.7rem;
  color: var(--color-text-muted);
}
</style>
