<template>
  <div>
    <NuxtRouteAnnouncer />
    <a href="#main" class="skip-link">Skip to content</a>
    <header>
      <nav aria-label="Main navigation">
        <NuxtLink to="/">ChampaShop</NuxtLink>
        <NuxtLink to="/produits">Catalog</NuxtLink>
        <NuxtLink to="/panier">Cart ({{ cart.count }})</NuxtLink>
        <NuxtLink to="/connexion">Sign in</NuxtLink>
      </nav>
    </header>
    <main id="main">
      <NuxtPage />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useCartStore } from './stores/cart'

const cart = useCartStore()
</script>

<style>
.skip-link {
  position: absolute;
  left: -9999px;
}
.skip-link:focus {
  left: 0;
}
</style>
