<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Product } from '~/types/dummyjson'
import { useCompareStore } from '~/stores/compare'
import {
  MAX_COMPARE,
  compareIdsToParam,
  compareSelectionsEqual,
  parseCompareIds
} from '~/utils/compare'
import { eurosToCents, formatCents, discountBadge } from '~/utils/money'

const route = useRoute()
const compare = useCompareStore()

// The URL is the single source of truth for the page: a shared link renders
// exactly the same products for anyone, server-side.
const rawParam = computed(() => String(route.query.ids ?? '').trim())
const ids = computed(() => parseCompareIds(rawParam.value, MAX_COMPARE))
const canonical = computed(() => compareIdsToParam(ids.value))

// Normalize an invalid URL (non-numeric, duplicate, > 3, wrong order of
// cleaning) with a replace redirect — SSR and client — so we never 500 and the
// address bar always reflects the real selection. The redirect is idempotent:
// the clean URL re-parses to itself, so there is no loop.
if (rawParam.value !== canonical.value) {
  await navigateTo(
    { path: '/comparer', query: canonical.value ? { ids: canonical.value } : {} },
    { replace: true }
  )
}

const { products, pending, error, refresh } = useCompareProducts(() => ids.value)

const loaded = computed<Product[]>(() => products.value ?? [])
const someFailed = computed(
  () => ids.value.length > 0 && loaded.value.length < ids.value.length
)

// The visitor's own cookie selection may differ from a link they received.
// We display the URL's selection and only overwrite the cookie on request.
const differsFromMine = computed(
  () => ids.value.length > 0 && !compareSelectionsEqual(ids.value, compare.ids)
)
function adoptSelection(): void {
  compare.replace(ids.value)
}

// ---- Table model --------------------------------------------------------
// French labels for the DummyJSON availability strings.
const AVAILABILITY_LABELS: Record<string, string> = {
  'In Stock': 'En stock',
  'Low Stock': 'Stock faible',
  'Out of Stock': 'Rupture de stock'
}

interface CompareRow {
  key: string
  label: string
  kind: 'image' | 'text'
  display: (p: Product) => string
  /** Primitive used to decide whether the row is identical across products. */
  compare: (p: Product) => string | number
  /** Numeric metric + direction when the row has a "best value". */
  best?: { metric: (p: Product) => number; direction: 'min' | 'max'; label: string }
}

const rows: CompareRow[] = [
  {
    key: 'image',
    label: 'Image',
    kind: 'image',
    display: (p) => p.thumbnail,
    // Comparing on id keeps the image row always visible (never "identical").
    compare: (p) => p.id
  },
  {
    key: 'price',
    label: 'Prix',
    kind: 'text',
    display: (p) => formatCents(eurosToCents(p.price)),
    compare: (p) => p.price,
    best: { metric: (p) => p.price, direction: 'min', label: 'Meilleur prix' }
  },
  {
    key: 'discount',
    label: 'Remise',
    kind: 'text',
    display: (p) => (p.discountPercentage > 0 ? discountBadge(p.discountPercentage) : '—'),
    compare: (p) => Math.round(p.discountPercentage)
  },
  {
    key: 'rating',
    label: 'Note',
    kind: 'text',
    display: (p) => `${p.rating.toFixed(1)} / 5`,
    compare: (p) => p.rating,
    best: { metric: (p) => p.rating, direction: 'max', label: 'Meilleure note' }
  },
  {
    key: 'availability',
    label: 'Disponibilité',
    kind: 'text',
    display: (p) =>
      `${AVAILABILITY_LABELS[p.availabilityStatus] ?? p.availabilityStatus} — ${p.stock} en stock`,
    compare: (p) => `${p.availabilityStatus}|${p.stock}`,
    best: { metric: (p) => p.stock, direction: 'max', label: 'Meilleur stock' }
  },
  {
    key: 'brand',
    label: 'Marque',
    kind: 'text',
    display: (p) => p.brand || '—',
    compare: (p) => p.brand || ''
  },
  {
    key: 'category',
    label: 'Catégorie',
    kind: 'text',
    display: (p) => p.category,
    compare: (p) => p.category
  },
  {
    key: 'weight',
    label: 'Poids',
    kind: 'text',
    display: (p) => `${p.weight}`,
    compare: (p) => p.weight
  },
  {
    key: 'dimensions',
    label: 'Dimensions (l × h × p)',
    kind: 'text',
    display: (p) =>
      `${p.dimensions.width} × ${p.dimensions.height} × ${p.dimensions.depth} cm`,
    compare: (p) =>
      `${p.dimensions.width}|${p.dimensions.height}|${p.dimensions.depth}`
  },
  {
    key: 'warranty',
    label: 'Garantie',
    kind: 'text',
    display: (p) => p.warrantyInformation,
    compare: (p) => p.warrantyInformation
  },
  {
    key: 'shipping',
    label: 'Livraison',
    kind: 'text',
    display: (p) => p.shippingInformation,
    compare: (p) => p.shippingInformation
  }
]

// Best cell(s) per row: only meaningful with ≥ 2 products, and skipped when
// every product ties (no single "best").
const bestByRow = computed<Record<string, Set<number>>>(() => {
  const result: Record<string, Set<number>> = {}
  if (loaded.value.length < 2) return result

  for (const row of rows) {
    if (!row.best) continue
    const values = loaded.value.map(row.best.metric)
    if (values.some((v) => !Number.isFinite(v))) continue
    if (values.every((v) => v === values[0])) continue

    const target =
      row.best.direction === 'min' ? Math.min(...values) : Math.max(...values)
    const set = new Set<number>()
    values.forEach((value, index) => {
      if (value === target) set.add(index)
    })
    result[row.key] = set
  }
  return result
})

const showDifferencesOnly = ref(false)

// "Differences only" hides rows whose value is identical for every product.
// Needs ≥ 2 products to mean anything; with fewer, show everything.
const visibleRows = computed<CompareRow[]>(() => {
  if (!showDifferencesOnly.value || loaded.value.length < 2) return rows
  return rows.filter((row) => {
    const values = loaded.value.map(row.compare)
    return !values.every((value) => value === values[0])
  })
})

// ---- Copy link ----------------------------------------------------------
const copyStatus = ref('')
const manualLink = ref('')

const shareUrl = computed(() =>
  import.meta.client
    ? window.location.href
    : `/comparer?ids=${canonical.value}`
)

async function copyLink(): Promise<void> {
  const url = shareUrl.value
  try {
    if (import.meta.client && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url)
      copyStatus.value = 'Lien copié dans le presse-papiers.'
      manualLink.value = ''
      return
    }
    throw new Error('Clipboard API unavailable')
  } catch {
    // Fallback: surface the link so it can be selected and copied by hand.
    manualLink.value = url
    copyStatus.value = 'Copie automatique indisponible : copiez le lien ci-dessous.'
  }
}

function selectAll(event: Event): void {
  ;(event.target as HTMLInputElement).select()
}

useSeoMeta({
  title: 'Comparateur — ChampaShop',
  description: 'Comparez jusqu’à 3 produits côte à côte sur ChampaShop.'
})
</script>

<template>
  <div class="compare container">
    <header class="compare__header">
      <p class="compare__eyebrow">Décidez en un coup d’œil</p>
      <h1 class="compare__title">Comparateur de produits</h1>
    </header>

    <!-- Adopt-selection prompt: the link's selection differs from the cookie. -->
    <div v-if="differsFromMine" class="compare__notice" role="status">
      <p class="compare__notice-text">
        Cette sélection provient d’un lien partagé et diffère de la vôtre.
      </p>
      <button type="button" class="btn btn--ghost" @click="adoptSelection">
        Remplacer ma sélection par celle-ci
      </button>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="compare__state" aria-busy="true">
      <div class="compare__spinner" aria-hidden="true" />
      <p>Chargement des produits…</p>
    </div>

    <!-- Hard error (the whole fetch threw; partial failures are handled below) -->
    <div v-else-if="error" class="compare__state" role="alert">
      <p class="compare__state-title">Impossible de charger la comparaison.</p>
      <button type="button" class="btn" @click="refresh()">Réessayer</button>
    </div>

    <!-- Empty: no ids in the URL -->
    <div v-else-if="ids.length === 0" class="compare__state">
      <p class="compare__state-title">Aucun produit à comparer.</p>
      <p class="compare__state-text">
        Ajoutez des produits depuis le catalogue avec le bouton « Comparer ».
      </p>
      <NuxtLink to="/products" class="btn">Parcourir le catalogue</NuxtLink>
    </div>

    <!-- Ids present but none could be loaded -->
    <div v-else-if="loaded.length === 0" class="compare__state">
      <p class="compare__state-title">Ces produits ne sont plus disponibles.</p>
      <NuxtLink to="/products" class="btn">Parcourir le catalogue</NuxtLink>
    </div>

    <template v-else>
      <div class="compare__toolbar">
        <label class="compare__toggle">
          <input v-model="showDifferencesOnly" type="checkbox" >
          Afficher uniquement les différences
        </label>

        <div class="compare__copy">
          <button type="button" class="btn btn--ghost" @click="copyLink">
            Copier le lien
          </button>
          <p class="compare__copy-status" role="status" aria-live="polite">
            {{ copyStatus }}
          </p>
        </div>
      </div>

      <label v-if="manualLink" class="compare__manual">
        <span>Copiez ce lien :</span>
        <input
          :value="manualLink"
          type="text"
          readonly
          class="compare__manual-input"
          @focus="selectAll"
        >
      </label>

      <p v-if="someFailed" class="compare__warning" role="status">
        Certains produits sélectionnés n’ont pas pu être chargés et ne sont pas affichés.
      </p>

      <div class="compare__scroll">
        <table class="compare-table">
          <caption class="compare-table__caption">
            Comparaison de {{ loaded.length }} produit{{ loaded.length > 1 ? 's' : '' }}
          </caption>
          <thead>
            <tr>
              <td class="compare-table__corner" />
              <th
                v-for="product in loaded"
                :key="product.id"
                scope="col"
                class="compare-table__producthead"
              >
                <NuxtLink :to="`/products/${product.id}`" class="compare-table__productlink">
                  {{ product.title }}
                </NuxtLink>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in visibleRows" :key="row.key">
              <th scope="row" class="compare-table__rowhead">{{ row.label }}</th>
              <td
                v-for="(product, index) in loaded"
                :key="product.id"
                class="compare-table__cell"
                :class="{ 'is-best': bestByRow[row.key]?.has(index) }"
              >
                <img
                  v-if="row.kind === 'image'"
                  :src="row.display(product)"
                  :alt="product.title"
                  class="compare-table__image"
                  width="120"
                  height="120"
                  loading="lazy"
                >
                <template v-else>
                  <span>{{ row.display(product) }}</span>
                  <span
                    v-if="row.best && bestByRow[row.key]?.has(index)"
                    class="compare-table__best"
                  >
                    {{ row.best.label }}
                  </span>
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>

<style scoped>
.compare {
  padding-block: 32px 96px;
}

.compare__header {
  text-align: center;
  margin-bottom: 24px;
}
.compare__eyebrow {
  margin: 0 0 0.35rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--color-primary);
}
.compare__title {
  font-family: var(--font-display);
  margin: 0;
}

.compare__notice {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem 1rem;
  padding: 1rem 1.25rem;
  margin-bottom: 1.5rem;
  background: var(--color-primary-soft);
  border: 1px solid var(--rose-200);
  border-radius: var(--radius-md);
}
.compare__notice-text {
  margin: 0;
  font-weight: 500;
  color: var(--color-primary-strong);
}

/* States */
.compare__state {
  text-align: center;
  padding: 72px 16px;
  color: var(--color-text-muted);
}
.compare__state-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 0.5rem;
}
.compare__state-text {
  margin: 0 0 1.25rem;
}
.compare__spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 1rem;
  border: 3px solid var(--color-primary-soft);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: compare-spin 0.8s linear infinite;
}
@keyframes compare-spin {
  to {
    transform: rotate(360deg);
  }
}

/* Toolbar */
.compare__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem 1rem;
  margin-bottom: 1rem;
}
.compare__toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  cursor: pointer;
}
.compare__copy {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.compare__copy-status {
  margin: 0;
  font-size: 0.85rem;
  color: var(--color-success);
}
.compare__manual {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}
.compare__manual-input {
  flex: 1 1 auto;
  min-width: 0;
}
.compare__warning {
  margin: 0 0 1rem;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-sm);
  background: #fbeede;
  color: #8a4b12;
  font-size: 0.9rem;
}

/* Table */
.compare__scroll {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
}

.compare-table {
  border-collapse: collapse;
  width: 100%;
  min-width: 520px;
}
.compare-table__caption {
  caption-side: top;
  text-align: left;
  padding: 1rem 1.25rem 0;
  font-weight: 600;
  color: var(--color-text-muted);
}

.compare-table__corner {
  background: var(--color-surface);
}

.compare-table th,
.compare-table td {
  padding: 0.85rem 1rem;
  text-align: left;
  vertical-align: top;
  border-bottom: 1px solid var(--color-border-soft);
}

.compare-table__producthead {
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 600;
  background: var(--color-bg-soft);
}
.compare-table__productlink {
  color: var(--color-text);
}
.compare-table__productlink:hover {
  color: var(--color-primary-strong);
}

/* Frozen first column (characteristic names + corner) on all widths, which
   is what makes the mobile horizontal scroll usable. */
.compare-table__rowhead,
.compare-table__corner {
  position: sticky;
  left: 0;
  z-index: 1;
  background: var(--color-surface);
  font-weight: 600;
  color: var(--color-text);
  min-width: 130px;
  box-shadow: 1px 0 0 var(--color-border-soft);
}

.compare-table__image {
  width: 100px;
  height: 100px;
  object-fit: contain;
  background: var(--color-bg-soft);
  border-radius: var(--radius-sm);
  padding: 6px;
}

.compare-table__cell.is-best {
  background: var(--color-success-soft);
}
.compare-table__best {
  display: inline-block;
  margin-top: 0.35rem;
  padding: 0.15rem 0.5rem;
  border-radius: var(--radius-pill);
  background: var(--color-success);
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
  white-space: nowrap;
}

@media (max-width: 640px) {
  .compare {
    padding-bottom: 120px;
  }
  .compare-table__image {
    width: 72px;
    height: 72px;
  }
  .compare-table__rowhead,
  .compare-table__corner {
    min-width: 108px;
  }
}
</style>
