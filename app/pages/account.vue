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

<template>
  <div class="account container">
    <header class="account__head">
      <h1 class="account__title">Mon compte</h1>
      <p class="muted">Bienvenue dans votre espace personnel.</p>
    </header>

    <div v-if="auth.user" class="account__card card">
      <div class="account__identity">
        <img
          v-if="auth.user.image"
          :src="auth.user.image"
          :alt="`Avatar de ${auth.user.firstName}`"
          class="account__avatar"
          width="96"
          height="96"
        >
        <div>
          <p class="account__hello">
            Bonjour {{ auth.user.firstName }} {{ auth.user.lastName }}.
          </p>
          <p class="muted account__username">@{{ auth.user.username }}</p>
        </div>
      </div>

      <dl class="account__details">
        <div class="account__row">
          <dt>Identifiant</dt>
          <dd>{{ auth.user.username }}</dd>
        </div>
        <div class="account__row">
          <dt>Adresse e-mail</dt>
          <dd>{{ auth.user.email }}</dd>
        </div>
      </dl>

      <div class="account__actions">
        <NuxtLink to="/products" class="btn btn--ghost">Continuer mes achats</NuxtLink>
        <button type="button" class="btn" @click="auth.logout()">
          Se déconnecter
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.account {
  padding-block: clamp(1.75rem, 1rem + 3vw, 3rem);
}
.account__head {
  margin-bottom: 1.5rem;
}
.account__title {
  font-family: var(--font-display);
  margin: 0 0 0.25rem;
}

.account__card {
  max-width: 560px;
  padding: clamp(1.5rem, 1rem + 2vw, 2.25rem);
}

.account__identity {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid var(--color-border-soft);
}
.account__avatar {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  object-fit: cover;
  background: var(--color-bg-soft);
  border: 2px solid var(--rose-200);
  flex: 0 0 auto;
}
.account__hello {
  margin: 0;
  font-weight: 600;
  font-size: 1.15rem;
}
.account__username {
  margin: 0.2rem 0 0;
  font-size: 0.9rem;
}

.account__details {
  display: grid;
  gap: 0.75rem;
  margin: 1.25rem 0;
}
.account__row {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.5rem;
  font-size: 0.95rem;
}
.account__row dt {
  font-weight: 600;
  color: var(--color-text-muted);
}
.account__row dd {
  margin: 0;
}

.account__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--color-border-soft);
}

@media (max-width: 460px) {
  .account__identity {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
