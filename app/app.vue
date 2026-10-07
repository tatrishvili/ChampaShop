<template>
  <div>
    <NuxtRouteAnnouncer />
    <a href="#main" class="skip-link">Skip to content</a>
    <header>
      <nav aria-label="Main navigation">
        <NuxtLink to="/">ChampaShop</NuxtLink>
        <NuxtLink to="/products">Catalogue</NuxtLink>
        <NuxtLink to="/cart">Panier ({{ cart.count }})</NuxtLink>
        <template v-if="auth.isAuthenticated">
          <NuxtLink to="/account">Mon compte</NuxtLink>
          <button type="button" @click="auth.logout()">Déconnexion</button>
        </template>
        <NuxtLink v-else to="/login">Connexion</NuxtLink>
      </nav>
    </header>
    <main id="main">
      <NuxtPage />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useCartStore } from './stores/cart'
import { useAuthStore } from './stores/auth'

const cart = useCartStore()
const auth = useAuthStore()
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
