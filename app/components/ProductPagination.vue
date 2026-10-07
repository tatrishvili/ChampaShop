<script setup lang="ts">
const props = defineProps<{
  page: number
  totalPages: number
}>()

const route = useRoute()

// Builds a link while keeping the other filters (search, sortBy, ...).
// page === 1 -> drop the param to keep the URL clean.
function linkTo(p: number) {
  return {
    query: { ...route.query, page: p <= 1 ? undefined : String(p) },
  }
}

// Page numbers to display, with ellipses beyond 7 pages.
const items = computed<(number | 'ellipsis')[]>(() => {
  const total = props.totalPages
  const current = props.page

  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const result: (number | 'ellipsis')[] = [1]
  const left = Math.max(2, current - 1)
  const right = Math.min(total - 1, current + 1)

  if (left > 2) result.push('ellipsis')
  for (let i = left; i <= right; i++) result.push(i)
  if (right < total - 1) result.push('ellipsis')
  result.push(total)

  return result
})

const hasPrev = computed(() => props.page > 1)
const hasNext = computed(() => props.page < props.totalPages)
</script>

<template>
  <nav class="pagination" aria-label="Pagination des produits">
    <NuxtLink
      v-if="hasPrev"
      :to="linkTo(page - 1)"
      class="pagination__btn"
      rel="prev"
    >
      ‹ Précédent
    </NuxtLink>
    <span v-else class="pagination__btn pagination__btn--disabled" aria-disabled="true">
      ‹ Précédent
    </span>

    <template v-for="(item, index) in items">
      <span
        v-if="item === 'ellipsis'"
        :key="`e-${index}`"
        class="pagination__ellipsis"
        aria-hidden="true"
      >
        …
      </span>
      <NuxtLink
        v-else
        :key="item"
        :to="linkTo(item)"
        class="pagination__page"
        :class="{ 'pagination__page--active': item === page }"
        :aria-current="item === page ? 'page' : undefined"
      >
        {{ item }}
      </NuxtLink>
    </template>

    <NuxtLink
      v-if="hasNext"
      :to="linkTo(page + 1)"
      class="pagination__btn"
      rel="next"
    >
      Suivant ›
    </NuxtLink>
    <span v-else class="pagination__btn pagination__btn--disabled" aria-disabled="true">
      Suivant ›
    </span>
  </nav>
</template>

<style scoped>
.pagination {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin: 24px 0;
}

.pagination__btn,
.pagination__page {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 36px;
  padding: 0 10px;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  text-decoration: none;
  color: inherit;
  font-size: 0.9rem;
  transition: background 0.15s ease, border-color 0.15s ease;
}

.pagination__btn:hover,
.pagination__page:hover {
  background: #f5f5f5;
}

.pagination__page--active {
  background: #111;
  border-color: #111;
  color: #fff;
}

.pagination__btn--disabled {
  opacity: 0.4;
  cursor: default;
}

.pagination__btn--disabled:hover {
  background: none;
}

.pagination__ellipsis {
  min-width: 24px;
  text-align: center;
  color: #999;
}
</style>
