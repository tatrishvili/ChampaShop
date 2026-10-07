<script setup lang="ts">
const { data, pending, error, refresh } = useProducts()
// Same URL-derived state as the data layer: page comes from the query (parsed
// defensively), so first paint, reload and shared links all agree.
const query = useProductQuery()

const currentPage = computed(() => query.value.page)
const totalPages = computed(() => Math.ceil((data.value?.total ?? 0) / PER_PAGE))

// Whether a narrowing filter is active, so the empty state can offer a reset.
// Sort and page never make the result empty, so they do not count here.
const hasActiveFilter = computed(() => {
  const q = query.value
  return Boolean(q.search || q.category) || q.minPrice !== null || q.maxPrice !== null
})
</script>

<template>
  <div class="catalog">
    <!-- Filters stay mounted in every state so the user can always adjust or
         clear them, even on an empty result or a network error. -->
    <ProductSearch />
    <ProductFilters />
    <ProductPriceFilter />

    <!-- Loading: skeleton grid. Shown on the first client load and on every
         refetch (filter / page change). SSR awaits the data, so the server
         never ships skeletons. -->
    <div
      v-if="pending"
      class="product-grid"
      aria-busy="true"
      aria-label="Chargement des produits"
    >
      <ProductCardSkeleton v-for="n in PER_PAGE" :key="n" />
    </div>

    <!-- Network error: explain + let the user retry the same request. -->
    <div v-else-if="error" class="catalog__state" role="alert">
      <p class="catalog__state-title">Impossible de charger les produits.</p>
      <p class="catalog__state-text">
        Vérifiez votre connexion, puis réessayez.
      </p>
      <button type="button" class="catalog__action" @click="refresh()">
        Réessayer
      </button>
    </div>

    <!-- No results. -->
    <div v-else-if="!data?.products?.length" class="catalog__state">
      <p class="catalog__state-title">Aucun produit ne correspond.</p>
      <template v-if="hasActiveFilter">
        <p class="catalog__state-text">
          Essayez d'élargir ou de réinitialiser vos filtres.
        </p>
        <NuxtLink to="/products" class="catalog__action">
          Réinitialiser les filtres
        </NuxtLink>
      </template>
    </div>

    <!-- Results. -->
    <template v-else>
      <div class="product-grid">
        <ProductCard
          v-for="product in data.products"
          :key="product.id"
          :product="product"
        />
      </div>

      <ProductPagination
        v-if="totalPages > 1"
        :page="currentPage"
        :total-pages="totalPages"
      />
    </template>
  </div>
</template>

<style scoped>
.catalog {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 16px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.catalog__state {
  text-align: center;
  padding: 64px 16px;
  color: #666;
}

.catalog__state-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #111;
  margin: 0 0 8px;
}

.catalog__state-text {
  margin: 0 0 20px;
}

.catalog__action {
  display: inline-block;
  padding: 10px 20px;
  border: 1px solid #111;
  border-radius: 8px;
  background: #111;
  color: #fff;
  font-size: 0.95rem;
  text-decoration: none;
  cursor: pointer;
}

.catalog__action:hover {
  background: #333;
  border-color: #333;
}
</style>
