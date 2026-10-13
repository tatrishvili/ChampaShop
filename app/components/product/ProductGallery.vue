<template>
  <div class="gallery">
    <div class="gallery__stage">
      <img
        v-if="images.length > 0"
        :src="images[active]"
        :alt="title"
        width="600"
        height="600"
        class="gallery__main"
      >
    </div>
    <div
      v-if="images.length > 1"
      class="gallery__thumbs"
      role="group"
      aria-label="Images du produit"
    >
      <button
        v-for="(src, index) in images"
        :key="src"
        type="button"
        class="gallery__thumb"
        :class="{ 'gallery__thumb--active': index === active }"
        :aria-pressed="index === active"
        :aria-label="`Afficher l'image ${index + 1}`"
        @click="active = index"
      >
        <img :src="src" :alt="`${title} miniature ${index + 1}`" width="80" height="80" loading="lazy">
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  images: string[]
  title: string
}>()

const active = ref<number>(0)

defineExpose({ active, imageCount: props.images.length })
</script>

<style scoped>
.gallery {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.gallery__stage {
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1 / 1;
  padding: 1.5rem;
  background: var(--color-bg-soft);
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.gallery__main {
  width: 100%;
  height: 100%;
  object-fit: contain;
  mix-blend-mode: multiply;
}

.gallery__thumbs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.gallery__thumb {
  width: 68px;
  height: 68px;
  padding: 0.3rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  cursor: pointer;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.gallery__thumb img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  mix-blend-mode: multiply;
}
.gallery__thumb:hover {
  border-color: var(--rose-300);
}
.gallery__thumb--active {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px var(--color-primary-soft);
}
</style>
