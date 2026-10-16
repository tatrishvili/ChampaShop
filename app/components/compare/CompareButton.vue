<script setup lang="ts">
import { computed } from 'vue'
import { useCompareStore } from '../../stores/compare'

const props = withDefaults(
  defineProps<{
    productId: number
    title: string
    /** `icon` = compact overlay on a product card, `full` = labelled button. */
    variant?: 'icon' | 'full'
  }>(),
  { variant: 'full' }
)

const compare = useCompareStore()

const selected = computed(() => compare.has(props.productId))

// The accessible name is stable ("Comparer <title>"); aria-pressed carries the
// on/off state. When the comparator is full, an un-selected button must stay
// CLICKABLE, not disabled: the spec requires that a 4th attempt adds nothing
// AND announces "Comparateur plein…" via aria-live. A disabled button emits no
// click, so the announcement would never fire. We only mark it visually/with a
// tooltip as blocked.
const blocked = computed(() => !selected.value && compare.isFull)

const label = computed(() => `Comparer ${props.title}`)

function onClick(): void {
  compare.toggle(props.productId)
}
</script>

<template>
  <button
    type="button"
    class="compare-btn"
    :class="[`compare-btn--${variant}`, { 'is-selected': selected, 'is-blocked': blocked }]"
    :aria-pressed="selected"
    :aria-label="label"
    :title="blocked ? 'Comparateur plein (3 maximum)' : label"
    @click="onClick"
  >
    <svg
      class="compare-btn__icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path v-if="selected" d="M20 6 9 17l-5-5" />
      <template v-else>
        <path d="M3 7h13" />
        <path d="m12 3 4 4-4 4" />
        <path d="M21 17H8" />
        <path d="m12 21-4-4 4-4" />
      </template>
    </svg>
    <span class="compare-btn__text">
      {{ selected ? 'Dans le comparateur' : 'Comparer' }}
    </span>
  </button>
</template>

<style scoped>
.compare-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  cursor: pointer;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  font-weight: 600;
  transition: background 0.18s ease, color 0.18s ease, border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.compare-btn:hover {
  border-color: var(--rose-200);
  color: var(--color-primary-strong);
  background: var(--color-primary-soft);
}

.compare-btn.is-selected {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
}
.compare-btn.is-selected:hover {
  background: var(--color-primary-strong);
  border-color: var(--color-primary-strong);
  color: #fff;
}

/* Full + un-selected: the button MUST stay clickable (a click announces
   "comparator full" to screen readers and shows the visible banner), so it
   keeps a normal cursor and hover — never the dimmed/not-allowed "disabled"
   look that made it feel dead. A dashed border is the only, subtle hint that
   the slot is full; the real feedback is the message shown on click. */
.compare-btn.is-blocked {
  border-style: dashed;
}

.compare-btn__icon {
  width: 1.05rem;
  height: 1.05rem;
  flex: 0 0 auto;
}

/* Full variant: a pill button for the product page. */
.compare-btn--full {
  padding: 0.7rem 1.4rem;
  border-radius: var(--radius-pill);
  font-size: 0.95rem;
  width: 100%;
}

/* Icon variant: compact circular overlay on a product card. */
.compare-btn--icon {
  padding: 0.4rem 0.7rem;
  border-radius: var(--radius-pill);
  font-size: 0.78rem;
  box-shadow: var(--shadow-sm);
}
.compare-btn--icon .compare-btn__icon {
  width: 0.95rem;
  height: 0.95rem;
}
/* Compact overlay: icon only (name comes from aria-label + title). */
.compare-btn--icon .compare-btn__text {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
