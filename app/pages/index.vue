<script setup lang="ts">
import type { ProductsResponse } from '~/types/dummyjson'
import RecentlyViewedSection from '../components/recently-viewed/RecentlyViewedSection.vue'

// On-brand, SSR-rendered data for the landing page: the beauty category feeds
// both the hero visual and the "Coups de cœur" strip (one request, coherent
// look). Failure is non-fatal — the sections simply render empty.
const { data } = await useAsyncData('home-beauty', () =>
  $fetch<ProductsResponse>('https://dummyjson.com/products/category/beauty'),
)

const heroProduct = computed(() => data.value?.products?.[0] ?? null)
const bestsellers = computed(() => data.value?.products?.slice(0, 4) ?? [])

// Curated entry points into the catalog (the catalog reads ?category=).
const categories = [
  { slug: 'skin-care', label: 'Soins de la peau', icon: '🧴' },
  { slug: 'beauty', label: 'Maquillage', icon: '💄' },
  { slug: 'fragrances', label: 'Parfums', icon: '🌸' },
]

const perks = [
  { icon: '🚚', title: 'Livraison offerte', text: 'Dès 50 € d\'achat' },
  { icon: '🔒', title: 'Paiement sécurisé', text: 'Transactions chiffrées' },
  { icon: '↩️', title: 'Retours 30 jours', text: 'Satisfait ou remboursé' },
]

useSeoMeta({
  title: 'ChampaShop — La beauté qui rayonne',
  description:
    'Soins, maquillage et parfums pour une routine beauté qui vous ressemble.',
})
</script>

<template>
  <div class="home">
    <!-- Hero -->
    <section class="hero">
      <div class="container hero__inner">
        <div class="hero__copy">
          <p class="hero__eyebrow">Nouvelle collection beauté</p>
          <h1 class="hero__title">
            La beauté qui<br>
            rayonne, <span class="hero__title-accent">de l'intérieur</span>
          </h1>
          <p class="hero__text">
            Des soins doux, des teintes lumineuses et des parfums enveloppants —
            choisis avec soin pour sublimer votre routine.
          </p>
          <div class="hero__actions">
            <NuxtLink to="/products" class="btn">Explorer le catalogue</NuxtLink>
            <a href="#bestsellers" class="btn btn--ghost">Nos coups de cœur</a>
          </div>
        </div>

        <div class="hero__media">
          <div class="hero__blob" aria-hidden="true" />
          <img
            v-if="heroProduct"
            :src="heroProduct.thumbnail"
            :alt="heroProduct.title"
            class="hero__product"
            width="420"
            height="420"
          >
          <div v-if="heroProduct" class="hero__card">
            <span class="hero__card-star" aria-hidden="true">★</span>
            <div>
              <strong>{{ heroProduct.rating.toFixed(1) }}/5</strong>
              <span class="muted">Coup de cœur client</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Perks -->
    <section class="container">
      <ul class="perks">
        <li v-for="perk in perks" :key="perk.title" class="perks__item">
          <span class="perks__icon" aria-hidden="true">{{ perk.icon }}</span>
          <div>
            <p class="perks__title">{{ perk.title }}</p>
            <p class="perks__text muted">{{ perk.text }}</p>
          </div>
        </li>
      </ul>
    </section>

    <!-- Categories -->
    <section class="container section">
      <header class="section__header">
        <h2 class="section__title">Explorer par catégorie</h2>
        <NuxtLink to="/products" class="section__link">Tout voir →</NuxtLink>
      </header>
      <div class="categories">
        <NuxtLink
          v-for="cat in categories"
          :key="cat.slug"
          :to="`/products?category=${cat.slug}`"
          class="category-card"
        >
          <span class="category-card__icon" aria-hidden="true">{{ cat.icon }}</span>
          <span class="category-card__label">{{ cat.label }}</span>
          <span class="category-card__arrow" aria-hidden="true">→</span>
        </NuxtLink>
      </div>
    </section>

    <!-- Bestsellers -->
    <section id="bestsellers" class="container section">
      <header class="section__header">
        <h2 class="section__title">Nos coups de cœur</h2>
        <NuxtLink to="/products" class="section__link">Tout voir →</NuxtLink>
      </header>
      <div v-if="bestsellers.length" class="home-grid">
        <ProductCard
          v-for="product in bestsellers"
          :key="product.id"
          :product="product"
        />
      </div>
      <p v-else class="muted">Les produits arrivent bientôt.</p>
    </section>

    <!-- Recently viewed -->
    <div class="container">
      <RecentlyViewedSection />
    </div>

    <!-- Promo banner -->
    <section class="container section">
      <div class="promo-banner">
        <div class="promo-banner__content">
          <p class="promo-banner__badge">Offre de bienvenue</p>
          <h2 class="promo-banner__title">−20% sur votre première commande</h2>
          <p class="promo-banner__text">
            Utilisez le code <strong>CHAMPA20</strong> au moment du paiement.
          </p>
        </div>
        <NuxtLink to="/products" class="btn promo-banner__btn">J'en profite</NuxtLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home {
  padding-bottom: 1rem;
}

/* ---- Hero ------------------------------------------------------------ */
.hero {
  background:
    radial-gradient(circle at 80% 10%, rgba(246, 174, 198, 0.3), transparent 45%),
    linear-gradient(180deg, var(--rose-50), #fff);
}
.hero__inner {
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap: 32px;
  align-items: center;
  padding-block: clamp(2.5rem, 1rem + 6vw, 5rem);
}
.hero__eyebrow {
  margin: 0 0 1rem;
  display: inline-block;
  padding: 0.3rem 0.85rem;
  border-radius: var(--radius-pill);
  background: #fff;
  color: var(--color-primary-strong);
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  box-shadow: var(--shadow-sm);
}
.hero__title {
  font-family: var(--font-display);
  font-size: clamp(2.2rem, 1.2rem + 4vw, 3.6rem);
  line-height: 1.1;
  margin: 0 0 1.1rem;
}
.hero__title-accent {
  font-style: italic;
  color: var(--color-primary);
}
.hero__text {
  max-width: 44ch;
  color: var(--color-text-muted);
  font-size: 1.05rem;
  margin: 0 0 1.75rem;
}
.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.hero__media {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 320px;
}
.hero__blob {
  position: absolute;
  inset: 8% 10%;
  background: linear-gradient(135deg, var(--rose-300), var(--rose-100));
  border-radius: 46% 54% 58% 42% / 52% 44% 56% 48%;
  filter: blur(2px);
  animation: blob 12s ease-in-out infinite;
}
@keyframes blob {
  50% {
    border-radius: 54% 46% 42% 58% / 44% 56% 48% 52%;
  }
}
.hero__product {
  position: relative;
  width: min(78%, 360px);
  height: auto;
  object-fit: contain;
  filter: drop-shadow(0 24px 40px rgba(181, 51, 95, 0.28));
  mix-blend-mode: multiply;
}
.hero__card {
  position: absolute;
  right: 4%;
  bottom: 8%;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.7rem 1rem;
  background: #fff;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
}
.hero__card-star {
  color: var(--color-star);
  font-size: 1.3rem;
}
.hero__card div {
  display: flex;
  flex-direction: column;
  line-height: 1.25;
  font-size: 0.85rem;
}

/* ---- Perks ----------------------------------------------------------- */
.perks {
  list-style: none;
  margin: -2.25rem 0 0;
  padding: 1.25rem;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  position: relative;
  background: #fff;
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}
.perks__item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}
.perks__icon {
  font-size: 1.5rem;
  flex: 0 0 auto;
}
.perks__title {
  margin: 0;
  font-weight: 600;
  font-size: 0.95rem;
}
.perks__text {
  margin: 0;
  font-size: 0.85rem;
}

/* ---- Sections -------------------------------------------------------- */
.section {
  margin-top: clamp(2.5rem, 1.5rem + 3vw, 4rem);
}
.section__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.section__title {
  font-family: var(--font-display);
  margin: 0;
}
.section__link {
  flex: 0 0 auto;
  font-weight: 600;
  font-size: 0.92rem;
  color: var(--color-primary-strong);
}

/* ---- Categories ------------------------------------------------------ */
.categories {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}
.category-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.4rem;
  background: var(--color-bg-soft);
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-md);
  color: var(--color-text);
  font-weight: 600;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
}
.category-card:hover {
  transform: translateY(-3px);
  border-color: var(--rose-200);
  box-shadow: var(--shadow-md);
  text-decoration: none;
}
.category-card__icon {
  font-size: 1.6rem;
}
.category-card__label {
  flex: 1 1 auto;
}
.category-card__arrow {
  color: var(--color-primary);
}

/* ---- Bestsellers grid ------------------------------------------------ */
.home-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

/* ---- Promo banner ---------------------------------------------------- */
.promo-banner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  padding: clamp(1.75rem, 1rem + 3vw, 3rem);
  border-radius: var(--radius-lg);
  background:
    radial-gradient(circle at 15% 20%, rgba(255, 255, 255, 0.35), transparent 45%),
    linear-gradient(120deg, var(--rose-500), var(--rose-600));
  color: #fff;
}
.promo-banner__content {
  min-width: 0;
}
.promo-banner__badge {
  margin: 0 0 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 0.74rem;
  font-weight: 600;
  opacity: 0.9;
}
.promo-banner__title {
  font-family: var(--font-display);
  margin: 0 0 0.4rem;
  color: #fff;
}
.promo-banner__text {
  margin: 0;
  opacity: 0.95;
}
.promo-banner__text strong {
  padding: 0.1rem 0.5rem;
  border-radius: var(--radius-sm);
  background: rgba(255, 255, 255, 0.22);
}
.promo-banner__btn {
  flex: 0 0 auto;
  background: #fff;
  color: var(--color-primary-strong);
}
.promo-banner__btn:hover {
  background: var(--rose-50);
  color: var(--color-primary-strong);
}

/* ---- Responsive ------------------------------------------------------ */
@media (max-width: 860px) {
  .hero__inner {
    grid-template-columns: 1fr;
    text-align: center;
  }
  .hero__text {
    margin-inline: auto;
  }
  .hero__actions {
    justify-content: center;
  }
  .hero__media {
    order: -1;
    min-height: 260px;
  }
  .home-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 680px) {
  .perks {
    grid-template-columns: 1fr;
    margin-top: -1.5rem;
  }
  .categories {
    grid-template-columns: 1fr;
  }
  .section__header {
    flex-wrap: wrap;
  }
}

@media (max-width: 460px) {
  .home-grid {
    grid-template-columns: 1fr;
  }
}
</style>
