<script setup lang="ts">
// Placeholder shown while products load. Mirrors ProductCard's layout (square
// image + two title lines + price + rating) so the grid does not jump when the
// real cards replace the skeletons. Purely decorative -> hidden from a11y tree.
</script>

<template>
  <div class="skeleton-card" aria-hidden="true">
    <div class="skeleton-card__image skeleton-card__shimmer" />
    <div class="skeleton-card__content">
      <div class="skeleton-card__line skeleton-card__line--title skeleton-card__shimmer" />
      <div class="skeleton-card__line skeleton-card__line--title-short skeleton-card__shimmer" />
      <div class="skeleton-card__line skeleton-card__line--price skeleton-card__shimmer" />
      <div class="skeleton-card__line skeleton-card__line--rating skeleton-card__shimmer" />
    </div>
  </div>
</template>

<style scoped>
.skeleton-card {
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
}

.skeleton-card__image {
  aspect-ratio: 1 / 1;
}

.skeleton-card__content {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-card__line {
  height: 14px;
  border-radius: 4px;
}

.skeleton-card__line--title {
  width: 95%;
}

.skeleton-card__line--title-short {
  width: 60%;
}

.skeleton-card__line--price {
  width: 40%;
  height: 16px;
  margin-top: 4px;
}

.skeleton-card__line--rating {
  width: 30%;
  height: 12px;
}

/* Rose-tinted base + sweeping highlight. */
.skeleton-card__shimmer {
  background: linear-gradient(90deg, #f6ebef 25%, #fdf4f7 37%, #f6ebef 63%);
  background-size: 400% 100%;
  animation: skeleton-shimmer 1.4s ease infinite;
}

@keyframes skeleton-shimmer {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}

/* Respect users who ask for less motion: keep a static placeholder. */
@media (prefers-reduced-motion: reduce) {
  .skeleton-card__shimmer {
    animation: none;
    background: #f6ebef;
  }
}
</style>
