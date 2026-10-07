<template>
  <section class="auth">
    <h1>Connexion</h1>

    <p class="hint">
      Compte de démonstration : <code>emilys</code> / <code>emilyspass</code>
    </p>

    <form novalidate @submit.prevent="onSubmit">
      <p v-if="errorMsg" role="alert" class="error">{{ errorMsg }}</p>

      <div class="field">
        <label for="username">Nom d'utilisateur</label>
        <input
          id="username"
          v-model="username"
          type="text"
          name="username"
          autocomplete="username"
          required
        >
      </div>

      <div class="field">
        <label for="password">Mot de passe</label>
        <input
          id="password"
          v-model="password"
          type="password"
          name="password"
          autocomplete="current-password"
          required
        >
      </div>

      <button type="submit" :disabled="pending">
        {{ pending ? 'Connexion…' : 'Se connecter' }}
      </button>
    </form>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const route = useRoute()

const username = ref<string>('')
const password = ref<string>('')
const pending = ref<boolean>(false)
const errorMsg = ref<string>('')

// Only follow a same-site, path-only redirect (must start with a single "/").
// Anything else (absolute URL, protocol-relative "//evil.com") falls back to
// /account, so the `redirect` query cannot be used as an open redirect.
function safeRedirect(value: unknown): string {
  const target = Array.isArray(value) ? value[0] : value
  if (typeof target === 'string' && /^\/(?!\/)/.test(target)) {
    return target
  }
  return '/account'
}

async function onSubmit(): Promise<void> {
  if (pending.value) return
  pending.value = true
  errorMsg.value = ''
  try {
    await auth.login(username.value, password.value)
    await navigateTo(safeRedirect(route.query.redirect))
  } catch {
    errorMsg.value = 'Identifiants invalides. Veuillez réessayer.'
  } finally {
    pending.value = false
  }
}

useSeoMeta({
  title: 'Connexion — ChampaShop',
  description: 'Connectez-vous à votre compte ChampaShop.'
})
</script>

<style scoped>
.auth {
  max-width: 24rem;
}
.hint {
  color: #555;
}
.field {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
}
.error {
  color: #b00020;
}
</style>
