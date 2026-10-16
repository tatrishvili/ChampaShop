<script setup lang="ts">
import { computed } from 'vue'
import { useCompareStore } from '../../stores/compare'
import { useCompareProducts } from '../../composables/useCompareProducts'
import { MAX_COMPARE, compareIdsToParam } from '../../utils/compare'

const compare = useCompareStore()
const route = useRoute()

// The bar follows the user across the site but is redundant on the comparator
// page itself, so hide it there.
const onComparePage = computed(() => route.path === '/comparer')
const visible = computed(() => compare.count > 0 && !onComparePage.value)

// The bar only shows thumbnails + titles, so fetch a tiny projection.
const { products } = useCompareProducts(() => compare.ids, {
  select: 'id,title,thumbnail'
})

// Render in the selection order even while a thumbnail is still loading, so
// the slots don't jump around.
const items = computed(() =>
  compare.ids.map((id) => ({
    id,
    product: products.value?.find((p) => p.id === id) ?? null
  }))
)

const compareLink = computed(() => ({
  path: '/comparer',
  query: { ids: compareIdsToParam(compare.ids) }
}))
</script>

<template>
  <!-- The live region stays mounted whenever the bar is visible; the "full"
       message can only fire at 3 items, when the bar is on screen. -->
  <div
    v-if="visible"
    class="compare-bar"
    role="region"
    aria-label="Comparateur de produits"
  >
    <div class="container compare-bar__inner">
      <div class="compare-bar__head">
        <span class="compare-bar__title">
          Comparer ({{ compare.count }}/{{ MAX_COMPARE }})
        </span>
        <button
          type="button"
          class="compare-bar__clear"
          @click="compare.clear()"
        >
          Tout retirer
        </button>
      </div>

      <ul class="compare-bar__list">
        <li v-for="item in items" :key="item.id" class="compare-bar__item">
          <img
            v-if="item.product"
            :src="item.product.thumbnail"
            :alt="item.product.title"
            class="compare-bar__thumb"
            width="48"
            height="48"
            loading="lazy"
          >
          <span v-else class="compare-bar__thumb compare-bar__thumb--empty" aria-hidden="true" />
          <span class="compare-bar__name">{{ item.product?.title ?? '…' }}</span>
          <button
            type="button"
            class="compare-bar__remove"
            :aria-label="`Retirer ${item.product?.title ?? 'ce produit'} du comparateur`"
            @click="compare.remove(item.id)"
          >
            <span aria-hidden="true">×</span>
          </button>
        </li>
      </ul>

      <NuxtLink :to="compareLink" class="btn compare-bar__cta">
        Comparer
      </NuxtLink>
    </div>

    <!-- Always-mounted live region: a screen reader announces reliably only
         when the TEXT of an existing node changes, so the node stays put and
         just its text updates. -->
    <p class="sr-only" role="status" aria-live="polite">
      {{ compare.announcement }}
    </p>

    <!-- Visible mirror for sighted users (the live region above already
         covers screen readers, so this one is aria-hidden to avoid a double
         announcement). This is the on-screen feedback for the 4th attempt. -->
    <p
      v-if="compare.announcement"
      class="compare-bar__alert"
      aria-hidden="true"
    >
      {{ compare.announcement }}
    </p>
  </div>
</template>

<style scoped>
.compare-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 60;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: saturate(180%) blur(12px);
  border-top: 1px solid var(--color-border-soft);
  box-shadow: var(--shadow-lg);
}

.compare-bar__inner {
  display: flex;
  align-items: center;
  gap: 1rem 1.25rem;
  flex-wrap: wrap;
  padding-block: 0.75rem;
}

.compare-bar__head {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.compare-bar__title {
  font-weight: 700;
  color: var(--color-text);
}

.compare-bar__clear {
  border: none;
  background: none;
  padding: 0;
  color: var(--color-text-muted);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  text-decoration: underline;
}
.compare-bar__clear:hover {
  color: var(--color-primary-strong);
}

.compare-bar__list {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  list-style: none;
  margin: 0;
  padding: 0;
  flex: 1 1 auto;
}

.compare-bar__item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.3rem 0.65rem 0.3rem 0.3rem;
  background: var(--color-bg-soft);
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-pill);
  max-width: 200px;
}

.compare-bar__thumb {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: contain;
  background: #fff;
  flex: 0 0 auto;
}
.compare-bar__thumb--empty {
  background: var(--color-border-soft);
}

.compare-bar__name {
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.compare-bar__remove {
  flex: 0 0 auto;
  width: 1.5rem;
  height: 1.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  background: var(--color-surface);
  color: var(--color-text-muted);
  font-size: 1.1rem;
  line-height: 1;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}
.compare-bar__remove:hover {
  background: var(--color-primary-soft);
  color: var(--color-primary-strong);
}

.compare-bar__cta {
  flex: 0 0 auto;
}

/* On-screen "comparator full" feedback: a thin strip under the bar row,
   tinted with the brand's soft rose so it reads as a gentle warning, not an
   error. Auto-dismissed by the store after a few seconds. */
.compare-bar__alert {
  margin: 0;
  padding: 0.55rem 1rem;
  background: var(--color-primary-soft);
  border-top: 1px solid var(--rose-200);
  color: var(--color-primary-strong);
  font-size: 0.88rem;
  font-weight: 600;
  text-align: center;
}

@media (max-width: 640px) {
  .compare-bar__inner {
    gap: 0.6rem 1rem;
  }
  .compare-bar__name {
    display: none;
  }
  .compare-bar__item {
    padding-right: 0.3rem;
  }
}
</style>
