<template>
  <p v-if="stock === 0" role="status" class="out">Out of stock</p>
  <p v-else-if="stock < 5" role="status" class="low">Only {{ stock }} left in stock</p>
  <p v-else class="ok">In stock</p>
</template>

<script setup lang="ts">
defineProps<{
  stock: number
}>()
</script>
