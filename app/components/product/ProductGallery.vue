<template>
  <div>
    <img
      v-if="images.length > 0"
      :src="images[active]"
      :alt="title"
      width="600"
      height="600"
    >
    <div v-if="images.length > 1" role="group" aria-label="Product images">
      <button
        v-for="(src, index) in images"
        :key="src"
        type="button"
        :aria-pressed="index === active"
        :aria-label="`Show image ${index + 1}`"
        @click="active = index"
      >
        <img :src="src" :alt="`${title} thumbnail ${index + 1}`" width="80" height="80" loading="lazy">
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
