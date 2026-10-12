<template>
  <section class="home">
    <h1>Bienvenue sur ChampaShop</h1>
    <p>Parcourez le catalogue ou gérez votre compte.</p>
    <nav class="links" aria-label="Raccourcis">
      <NuxtLink to="/products">Voir le catalogue</NuxtLink>
      <NuxtLink v-if="auth.isAuthenticated" to="/account">Mon compte</NuxtLink>
      <NuxtLink v-else to="/login">Se connecter</NuxtLink>
    </nav>

    <RecentlyViewedSection />
  </section>
</template>

<script setup lang="ts">
import { useAuthStore } from '../stores/auth'
import RecentlyViewedSection from '../components/recently-viewed/RecentlyViewedSection.vue'

const auth = useAuthStore()

useSeoMeta({
  title: 'ChampaShop',
  description: 'ChampaShop — catalogue de produits.'
})
</script>

<style scoped>
.links {
  display: flex;
  gap: 1rem;
}
</style>
