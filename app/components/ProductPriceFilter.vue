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
  gap: 12px;
  margin-bottom: 20px;
}

.price-filter__field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.price-filter__label {
  font-size: 0.8rem;
  color: #666;
}

.price-filter__input {
  width: 110px;
  padding: 10px 14px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  font-size: 0.95rem;
  background: #fff;
}

.price-filter__input:focus {
  outline: none;
  border-color: #111;
}

.price-filter__sep {
  padding-bottom: 10px;
  color: #999;
}
</style>
