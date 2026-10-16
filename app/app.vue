<template>
  <div class="app-shell">
    <NuxtRouteAnnouncer />
    <a href="#main" class="skip-link">Aller au contenu</a>

    <header class="site-header">
      <div class="container site-header__inner">
        <NuxtLink to="/" class="brand" aria-label="ChampaShop — accueil">
          <span class="brand__mark" aria-hidden="true">✿</span>
          <span class="brand__name">ChampaShop</span>
        </NuxtLink>

        <nav class="site-nav" aria-label="Navigation principale">
          <NuxtLink to="/" class="site-nav__link">Accueil</NuxtLink>
          <NuxtLink to="/products" class="site-nav__link">Catalogue</NuxtLink>
          <NuxtLink v-if="!auth.isAuthenticated" to="/login" class="site-nav__link">
            Connexion
          </NuxtLink>
          <template v-else>
            <NuxtLink to="/account" class="site-nav__account">
              <img
                v-if="auth.user?.image"
                :src="auth.user.image"
                :alt="auth.displayName"
                class="site-nav__avatar"
                width="26"
                height="26"
              >
              <span class="site-nav__account-name">{{ auth.displayName }}</span>
            </NuxtLink>
            <button type="button" class="site-nav__logout" @click="auth.logout()">
              Déconnexion
            </button>
          </template>
        </nav>

        <NuxtLink to="/cart" class="cart-pill" aria-label="Voir le panier">
          <svg
            class="cart-pill__icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
            <path d="M3 6h18" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          <span class="cart-pill__label">Panier</span>
          <span v-if="cart.count > 0" class="cart-pill__count">{{ cart.count }}</span>
        </NuxtLink>
      </div>
    </header>

    <main id="main" class="site-main">
      <NuxtPage />
    </main>

    <CompareBar />

    <footer class="site-footer">
      <div class="container site-footer__inner">
        <div class="site-footer__brand">
          <span class="brand__mark" aria-hidden="true">✿</span>
          <span class="brand__name">ChampaShop</span>
          <p class="muted">La beauté qui rayonne, de l'intérieur.</p>
        </div>
        <nav class="site-footer__links" aria-label="Liens de pied de page">
          <NuxtLink to="/products">Catalogue</NuxtLink>
          <NuxtLink to="/cart">Panier</NuxtLink>
          <NuxtLink to="/login">Connexion</NuxtLink>
        </nav>
        <p class="site-footer__legal muted">© {{ year }} ChampaShop. Tous droits réservés.</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCartStore } from './stores/cart'
import { useAuthStore } from './stores/auth'
import CompareBar from './components/compare/CompareBar.vue'

const cart = useCartStore()
const auth = useAuthStore()
const year = computed(() => new Date().getFullYear())
</script>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.site-main {
  flex: 1 0 auto;
}

/* Skip link (visible on keyboard focus) */
.skip-link {
  position: absolute;
  left: 50%;
  top: 0;
  transform: translate(-50%, -120%);
  z-index: 100;
  padding: 0.6rem 1rem;
  background: var(--color-primary);
  color: #fff;
  border-radius: 0 0 var(--radius-sm) var(--radius-sm);
  transition: transform 0.15s ease;
}
.skip-link:focus {
  transform: translate(-50%, 0);
}

/* ---- Header ---------------------------------------------------------- */
.site-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: saturate(180%) blur(12px);
  border-bottom: 1px solid var(--color-border-soft);
}

.site-header__inner {
  display: flex;
  align-items: center;
  gap: 1rem;
  min-height: var(--header-h);
  flex-wrap: wrap;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text);
  text-decoration: none;
  margin-right: auto;
}
.brand:hover {
  text-decoration: none;
}
.brand__mark {
  color: var(--color-primary);
  font-size: 1.3rem;
  line-height: 1;
}
.brand__name {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1.4rem;
  letter-spacing: 0.01em;
}

.site-nav {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-wrap: wrap;
}
.site-nav__link {
  padding: 0.45rem 0.9rem;
  border-radius: var(--radius-pill);
  color: var(--color-text);
  font-weight: 500;
  font-size: 0.95rem;
  text-decoration: none;
  transition: background 0.15s ease, color 0.15s ease;
}
.site-nav__link:hover {
  background: var(--color-primary-soft);
  color: var(--color-primary-strong);
  text-decoration: none;
}
.site-nav__link.router-link-exact-active {
  background: var(--color-primary-soft);
  color: var(--color-primary-strong);
}

.site-nav__account {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.3rem 0.75rem 0.3rem 0.35rem;
  border-radius: var(--radius-pill);
  background: var(--color-primary-soft);
  color: var(--color-primary-strong);
  font-weight: 600;
  font-size: 0.9rem;
  text-decoration: none;
}
.site-nav__account:hover {
  background: var(--rose-200);
  text-decoration: none;
}
.site-nav__avatar {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  object-fit: cover;
}
.site-nav__logout {
  padding: 0.45rem 0.9rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  background: transparent;
  color: var(--color-text);
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}
.site-nav__logout:hover {
  background: var(--color-primary-soft);
  border-color: var(--rose-200);
  color: var(--color-primary-strong);
}

.cart-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-pill);
  background: var(--color-primary);
  color: #fff;
  font-weight: 600;
  font-size: 0.9rem;
  text-decoration: none;
  box-shadow: var(--shadow-sm);
  transition: background 0.2s ease, box-shadow 0.2s ease;
}
.cart-pill:hover {
  background: var(--color-primary-strong);
  text-decoration: none;
  box-shadow: var(--shadow-md);
}
.cart-pill__icon {
  width: 1.1rem;
  height: 1.1rem;
  flex: 0 0 auto;
}
.cart-pill__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.3rem;
  height: 1.3rem;
  padding: 0 0.35rem;
  border-radius: var(--radius-pill);
  background: #fff;
  color: var(--color-primary-strong);
  font-size: 0.75rem;
  font-weight: 700;
}

/* ---- Footer ---------------------------------------------------------- */
.site-footer {
  margin-top: 3rem;
  background: var(--color-bg-soft);
  border-top: 1px solid var(--color-border-soft);
}
.site-footer__inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem 2rem;
  padding-block: 2rem;
}
.site-footer__brand {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.site-footer__brand p {
  margin: 0;
  width: 100%;
  font-size: 0.9rem;
}
.site-footer__links {
  display: flex;
  gap: 1.25rem;
  margin-left: auto;
}
.site-footer__links a {
  color: var(--color-text);
  font-size: 0.92rem;
}
.site-footer__links a:hover {
  color: var(--color-primary-strong);
}
.site-footer__legal {
  width: 100%;
  margin: 0;
  font-size: 0.82rem;
}

@media (max-width: 560px) {
  .brand__name {
    font-size: 1.2rem;
  }
  .cart-pill__label {
    display: none;
  }
  .site-footer__links {
    margin-left: 0;
  }
}
</style>
