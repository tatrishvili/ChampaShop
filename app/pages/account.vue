<template>
  <section class="account">
    <h1>Mon compte</h1>

    <div v-if="auth.user" class="profile">
      <img :src="auth.user.image" :alt="`Avatar de ${auth.user.firstName}`" width="96" height="96">
      <p class="welcome">Bonjour {{ auth.user.firstName }} {{ auth.user.lastName }}.</p>

      <dl>
        <dt>Nom d'utilisateur</dt>
        <dd>{{ auth.user.username }}</dd>
        <dt>Adresse e-mail</dt>
        <dd>{{ auth.user.email }}</dd>
      </dl>

      <button type="button" @click="auth.logout()">Se déconnecter</button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useAuthStore } from '../stores/auth'

// Signed-in-only page: the `auth` middleware redirects to /login otherwise.
definePageMeta({
  middleware: 'auth'
})

const auth = useAuthStore()

useSeoMeta({
  title: 'Mon compte — ChampaShop',
  description: 'Gérez votre compte ChampaShop.'
})
</script>

<style scoped>
.account {
  max-width: 32rem;
}
.profile img {
  border-radius: 50%;
  object-fit: cover;
}
dl {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.25rem 1rem;
}
dt {
  font-weight: 600;
}
</style>
