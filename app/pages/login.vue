<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore, DEMO_CREDENTIALS } from '~/stores/auth'

const auth = useAuthStore()
const route = useRoute()

// Prefilled with the dummyjson demo account so sign-in works out of the box.
const username = ref<string>(DEMO_CREDENTIALS.username)
const password = ref<string>(DEMO_CREDENTIALS.password)
const remember = ref<boolean>(true)
const pending = ref<boolean>(false)
const error = ref<string>('')

function fillDemo(): void {
  username.value = DEMO_CREDENTIALS.username
  password.value = DEMO_CREDENTIALS.password
  error.value = ''
}

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
  error.value = ''
  try {
    await auth.login(username.value, password.value)
    await navigateTo(safeRedirect(route.query.redirect))
  } catch {
    error.value =
      'Identifiant ou mot de passe incorrect. Essayez le compte de démo.'
  } finally {
    pending.value = false
  }
}

useSeoMeta({
  title: 'Connexion — ChampaShop',
  description: 'Connectez-vous à votre compte ChampaShop.'
})
</script>

<template>
  <div class="auth">
    <div class="container auth__inner">
      <!-- Brand / decorative panel -->
      <aside class="auth__aside" aria-hidden="true">
        <div class="auth__aside-content">
          <span class="auth__mark">✿</span>
          <p class="auth__aside-title">La beauté qui rayonne, de l'intérieur.</p>
          <p class="auth__aside-text">
            Retrouvez vos favoris, suivez vos commandes et profitez d'offres
            exclusives.
          </p>
        </div>
      </aside>

      <!-- Signed-in state -->
      <div v-if="auth.isAuthenticated" class="auth__panel auth__panel--signed">
        <img
          v-if="auth.user?.image"
          :src="auth.user.image"
          :alt="auth.displayName"
          class="auth__avatar"
          width="72"
          height="72"
        >
        <h1 class="auth__title">Bonjour {{ auth.displayName }} 👋</h1>
        <p class="auth__subtitle muted">
          Vous êtes connecté avec le compte <strong>{{ auth.user?.username }}</strong>.
        </p>
        <div class="auth__signed-actions">
          <NuxtLink to="/account" class="btn">Mon compte</NuxtLink>
          <NuxtLink to="/products" class="btn btn--ghost">Continuer mes achats</NuxtLink>
          <button type="button" class="btn btn--ghost" @click="auth.logout()">
            Se déconnecter
          </button>
        </div>
      </div>

      <!-- Form -->
      <div v-else class="auth__panel">
        <header class="auth__header">
          <h1 class="auth__title">Connexion</h1>
          <p class="auth__subtitle muted">
            Ravis de vous revoir. Entrez vos identifiants pour continuer.
          </p>
        </header>

        <div class="demo">
          <div class="demo__text">
            <p class="demo__title">Compte de démo</p>
            <p class="demo__creds">
              <code>{{ DEMO_CREDENTIALS.username }}</code> ·
              <code>{{ DEMO_CREDENTIALS.password }}</code>
            </p>
          </div>
          <button type="button" class="demo__btn" @click="fillDemo">Remplir</button>
        </div>

        <form class="auth__form" novalidate @submit.prevent="onSubmit">
          <div class="field">
            <label class="field__label" for="username">Identifiant</label>
            <input
              id="username"
              v-model="username"
              class="field__input"
              type="text"
              name="username"
              autocomplete="username"
              placeholder="emilys"
              required
            >
          </div>

          <div class="field">
            <label class="field__label" for="password">Mot de passe</label>
            <input
              id="password"
              v-model="password"
              class="field__input"
              type="password"
              name="password"
              autocomplete="current-password"
              placeholder="••••••••"
              required
            >
          </div>

          <div class="auth__row">
            <label class="checkbox">
              <input v-model="remember" type="checkbox">
              <span>Se souvenir de moi</span>
            </label>
            <a href="#" class="auth__forgot">Mot de passe oublié ?</a>
          </div>

          <p v-if="error" class="auth__error" role="alert">{{ error }}</p>

          <button type="submit" class="btn btn--block" :disabled="pending">
            <span v-if="pending" class="auth__spinner" aria-hidden="true" />
            {{ pending ? 'Connexion…' : 'Se connecter' }}
          </button>
        </form>

        <div class="auth__divider"><span>ou</span></div>

        <p class="auth__switch">
          Pas encore de compte ?
          <a href="#" class="auth__switch-link">Créer un compte</a>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth {
  padding-block: clamp(2rem, 1rem + 4vw, 4rem);
}

.auth__inner {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  max-width: 940px;
  background: var(--color-surface);
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

/* Decorative panel */
.auth__aside {
  display: flex;
  align-items: flex-end;
  padding: 2.5rem;
  color: #fff;
  background:
    radial-gradient(circle at 20% 15%, rgba(255, 255, 255, 0.3), transparent 45%),
    linear-gradient(150deg, var(--rose-400), var(--rose-600));
}
.auth__aside-content {
  max-width: 30ch;
}
.auth__mark {
  display: block;
  font-size: 2.5rem;
  margin-bottom: 1rem;
}
.auth__aside-title {
  font-family: var(--font-display);
  font-size: 1.6rem;
  line-height: 1.25;
  margin: 0 0 0.75rem;
}
.auth__aside-text {
  margin: 0;
  opacity: 0.92;
  font-size: 0.95rem;
}

/* Form panel */
.auth__panel {
  padding: clamp(1.75rem, 1rem + 3vw, 3rem);
}
.auth__header {
  margin-bottom: 1.25rem;
}
.auth__title {
  font-family: var(--font-display);
  margin: 0 0 0.4rem;
}
.auth__subtitle {
  margin: 0;
  font-size: 0.95rem;
}

/* Demo account hint */
.demo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 0.85rem 1rem;
  background: var(--color-bg-soft);
  border: 1px dashed var(--rose-200);
  border-radius: var(--radius-sm);
}
.demo__title {
  margin: 0 0 0.15rem;
  font-weight: 600;
  font-size: 0.85rem;
}
.demo__creds {
  margin: 0;
  font-size: 0.82rem;
  color: var(--color-text-muted);
}
.demo__creds code {
  padding: 0.1rem 0.35rem;
  border-radius: 6px;
  background: #fff;
  color: var(--color-primary-strong);
  font-size: 0.8rem;
}
.demo__btn {
  flex: 0 0 auto;
  padding: 0.4rem 0.9rem;
  border: 1px solid var(--rose-200);
  border-radius: var(--radius-pill);
  background: #fff;
  color: var(--color-primary-strong);
  font-weight: 600;
  font-size: 0.82rem;
  cursor: pointer;
}
.demo__btn:hover {
  background: var(--color-primary-soft);
}

.auth__form {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.field__label {
  font-weight: 600;
  font-size: 0.9rem;
}
.field__input {
  width: 100%;
  border-radius: var(--radius-sm);
}

.auth__row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  font-size: 0.9rem;
}
.checkbox {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  cursor: pointer;
}
.checkbox input {
  width: 1rem;
  height: 1rem;
  accent-color: var(--color-primary);
}
.auth__forgot {
  font-weight: 500;
}

.auth__error {
  margin: 0;
  padding: 0.7rem 0.9rem;
  border-radius: var(--radius-sm);
  background: var(--color-primary-soft);
  color: var(--color-primary-strong);
  font-size: 0.88rem;
  font-weight: 500;
}

.auth__spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-top-color: #fff;
  border-radius: 50%;
  animation: auth-spin 0.7s linear infinite;
}
@keyframes auth-spin {
  to {
    transform: rotate(360deg);
  }
}

.auth__divider {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 1.5rem 0;
  color: var(--color-text-muted);
  font-size: 0.85rem;
}
.auth__divider::before,
.auth__divider::after {
  content: '';
  flex: 1 1 auto;
  height: 1px;
  background: var(--color-border-soft);
}

.auth__switch {
  margin: 0;
  text-align: center;
  font-size: 0.95rem;
  color: var(--color-text-muted);
}
.auth__switch-link {
  font-weight: 600;
}

/* Signed-in state */
.auth__panel--signed {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 0.6rem;
}
.auth__avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  object-fit: cover;
  background: var(--color-bg-soft);
  border: 2px solid var(--rose-200);
}
.auth__signed-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.75rem;
}

@media (max-width: 760px) {
  .auth__inner {
    grid-template-columns: 1fr;
    max-width: 460px;
  }
  .auth__aside {
    display: none;
  }
}
</style>
