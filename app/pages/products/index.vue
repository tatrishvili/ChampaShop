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
  <div class="catalog container">
    <header class="catalog__header">
      <p class="catalog__eyebrow">Notre sélection</p>
      <h1 class="catalog__title">Catalogue beauté</h1>
      <p class="catalog__subtitle">
        Soins, parfums et essentiels qui font rayonner votre routine.
      </p>
    </header>

    <!-- Filters stay mounted in every state so the user can always adjust or
         clear them, even on an empty result or a network error. -->
    <div class="catalog__toolbar">
      <ProductSearch />
      <ProductFilters />
      <ProductPriceFilter />
    </div>

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
  padding-block: 32px 48px;
}

.catalog__header {
  text-align: center;
  max-width: 640px;
  margin: 0 auto 28px;
}

.catalog__eyebrow {
  margin: 0 0 0.35rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--color-primary);
}

.catalog__title {
  font-family: var(--font-display);
  margin: 0 0 0.5rem;
}

.catalog__subtitle {
  margin: 0;
  color: var(--color-text-muted);
}

.catalog__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 12px 16px;
  padding: 16px;
  margin-bottom: 28px;
  background: var(--color-surface);
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 20px;
}

.catalog__state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 72px 16px;
  color: var(--color-text-muted);
}

.catalog__state-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 8px;
}

.catalog__state-text {
  margin: 0 0 20px;
}

.catalog__action {
  display: inline-flex;
  align-items: center;
  padding: 0.7rem 1.4rem;
  border-radius: var(--radius-pill);
  background: var(--color-primary);
  color: #fff;
  font-weight: 600;
  font-size: 0.95rem;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.2s ease, box-shadow 0.2s ease;
}

.catalog__action:hover {
  background: var(--color-primary-strong);
  box-shadow: var(--shadow-md);
}

@media (max-width: 560px) {
  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 14px;
  }
  .catalog__toolbar {
    padding: 14px;
    border-radius: var(--radius-md);
  }
}
</style>
