<script setup lang="ts">
import type { Component } from 'vue'
import {
  Accessibility,
  ArrowRight,
  Code2,
  Globe,
  LayoutGrid,
  Link2,
  MousePointerClick,
  TrendingUp,
} from '@lucide/vue'

import { useAuthStore } from '@/features/auth/auth.store'
import FormAlert from '@/features/auth/components/FormAlert.vue'
import { useDemoSignIn } from '@/features/auth/composables/useDemoSignIn'
import AppLogo from '@/layouts/AppLogo.vue'
import ThemeMenu from '@/layouts/ThemeMenu.vue'
import BaseButton from '@/shared/ui/BaseButton.vue'

/**
 * Public home page: what Atollo is, a look at the real product, and one obvious
 * action. Most visitors of this portfolio project are recruiters with a minute to
 * spare: the demo opens in one click, without any form.
 */
const auth = useAuthStore()
const { openDemo, loading, error } = useDemoSignIn()

const REPOSITORY = 'https://github.com/lauradimitroff/atollo'

const features: { icon: Component; title: string; text: string }[] = [
  {
    icon: LayoutGrid,
    title: 'Tous vos sites d’un coup d’œil',
    text: 'La page d’accueil compare chaque site sur la même période : visiteurs, évolution et tendance.',
  },
  {
    icon: TrendingUp,
    title: 'Comparaison automatique',
    text: 'Chaque chiffre est mis en regard de la période précédente, et la courbe superpose les deux.',
  },
  {
    icon: MousePointerClick,
    title: 'Filtres en un clic',
    text: 'Cliquez sur « Mobile » ou « Recherche organique » : tout le tableau de bord se filtre.',
  },
  {
    icon: Globe,
    title: 'Carte du monde',
    text: 'Les pays et les villes de vos visiteurs, en Europe ou dans le monde entier.',
  },
  {
    icon: Link2,
    title: 'Des vues partageables',
    text: 'Période, filtres et indicateur vivent dans l’adresse : un lien suffit pour partager une vue.',
  },
  {
    icon: Accessibility,
    title: 'Accessible, clair ou sombre',
    text: 'Navigable au clavier, lisible par les lecteurs d’écran, en thème clair, sombre ou automatique.',
  },
]

const showcases = [
  {
    image: 'sites',
    title: 'Pensé pour suivre plusieurs sites',
    text: 'Freelances et agences gèrent souvent une dizaine de sites clients. Atollo les réunit sur une seule page, triés par audience, avec leur tendance : on repère en un instant celui qui décolle et celui qui s’essouffle.',
    alt: 'Page « Tous les sites » d’Atollo : huit sites fictifs avec leurs visiteurs, leur évolution et une courbe de tendance.',
  },
  {
    image: 'locations',
    title: 'Des réponses, pas des rapports',
    text: 'D’où viennent les visiteurs ? Sur quel appareil ? Quelles pages les retiennent ? Chaque question a sa page, avec un graphique lisible et le tableau des chiffres juste en dessous.',
    alt: 'Page « Localisation » d’Atollo : carte de l’Europe colorée selon le nombre de visites, avec les pays et les villes.',
  },
]

const engineering = [
  'Statistiques calculées à partir de visites brutes générées, jamais saisies en dur.',
  'Données derrière des contrats TypeScript : des services simulés aujourd’hui, une vraie base demain, sans toucher aux écrans.',
  'Tests unitaires (Vitest) et de bout en bout (Playwright), sur ordinateur et sur mobile.',
  'Accessibilité travaillée : clavier, focus visible, graphiques doublés de tableaux pour les lecteurs d’écran.',
]

const stack = [
  'Vue 3',
  'TypeScript',
  'Vite',
  'Pinia',
  'Vue Router',
  'Tailwind CSS v4',
  'Reka UI',
  'ECharts',
  'Zod',
  'Vitest',
  'Playwright',
]

const linkButton =
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium whitespace-nowrap transition-colors'
</script>

<template>
  <div class="relative isolate min-h-dvh overflow-x-clip bg-canvas">
    <!-- A faint glow of the brand gradient behind the hero; decoration only. -->
    <div
      class="pointer-events-none absolute top-[-18rem] left-1/2 -z-10 size-[48rem] -translate-x-1/2 rounded-full bg-brand-gradient opacity-[0.14] blur-3xl dark:opacity-[0.18]"
      aria-hidden="true"
    />

    <a
      href="#contenu"
      class="sr-only z-50 rounded-lg bg-surface px-3 py-2 shadow-pop focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
    >
      Aller au contenu
    </a>

    <header class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-8">
      <RouterLink to="/" class="rounded-md" aria-label="Atollo, accueil">
        <AppLogo />
      </RouterLink>

      <nav
        class="hidden items-center gap-6 text-[13px] text-fg-muted md:flex"
        aria-label="Sections"
      >
        <RouterLink :to="{ hash: '#fonctionnalites' }" class="hover:text-fg">
          Fonctionnalités
        </RouterLink>
        <RouterLink :to="{ hash: '#technique' }" class="hover:text-fg">Sous le capot</RouterLink>
        <a :href="REPOSITORY" class="hover:text-fg" target="_blank" rel="noopener"> Code source </a>
      </nav>

      <div class="flex items-center gap-2">
        <ThemeMenu />
        <RouterLink
          v-if="auth.isAuthenticated"
          :to="{ name: 'sites' }"
          :class="[linkButton, 'h-8 bg-fg px-3 text-[13px] text-canvas hover:bg-fg/90']"
        >
          Ouvrir Atollo
        </RouterLink>
        <RouterLink
          v-else
          :to="{ name: 'login' }"
          :class="[
            linkButton,
            'h-8 border border-line bg-surface px-3 text-[13px] shadow-xs hover:bg-surface-muted',
          ]"
        >
          Se connecter
        </RouterLink>
      </div>
    </header>

    <main id="contenu">
      <!-- Hero -->
      <section class="mx-auto max-w-3xl px-4 pt-12 text-center sm:px-8 sm:pt-20">
        <p
          class="mx-auto inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-3 py-1 text-xs text-fg-muted shadow-xs"
        >
          <span class="size-1.5 rounded-full bg-brand-gradient" aria-hidden="true" />
          Projet portfolio · données 100 % fictives
        </p>
        <h1
          class="mt-6 text-4xl leading-[1.08] font-semibold tracking-tight text-balance sm:text-6xl"
        >
          Les statistiques de tous vos sites,
          <!-- Stops before the teal: it would lack contrast as text on the light canvas. -->
          <span
            class="bg-[linear-gradient(90deg,var(--grad-a),var(--grad-b))] bg-clip-text text-transparent"
          >
            enfin lisibles.
          </span>
        </h1>
        <p class="mx-auto mt-5 max-w-xl text-base text-pretty text-fg-muted sm:text-lg">
          Atollo réunit l’audience de vos sites dans un seul tableau de bord : visiteurs, sources,
          pages, pays et appareils, comparés d’une période à l’autre.
        </p>

        <div class="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <RouterLink
            v-if="auth.isAuthenticated"
            :to="{ name: 'sites' }"
            :class="[linkButton, 'h-11 bg-fg px-5 text-sm text-canvas hover:bg-fg/90']"
          >
            Ouvrir mon tableau de bord
            <ArrowRight class="size-4" aria-hidden="true" />
          </RouterLink>
          <template v-else>
            <BaseButton
              variant="primary"
              class="h-11 w-full px-5 text-sm sm:w-auto"
              :loading
              @click="openDemo"
            >
              Explorer la démo
              <ArrowRight aria-hidden="true" />
            </BaseButton>
            <RouterLink
              :to="{ name: 'register' }"
              :class="[
                linkButton,
                'h-11 w-full border border-line bg-surface px-5 text-sm shadow-xs hover:bg-surface-muted sm:w-auto',
              ]"
            >
              Créer un compte
            </RouterLink>
          </template>
        </div>
        <p v-if="!auth.isAuthenticated" class="mt-3 text-xs text-fg-subtle">
          Sans inscription : 8 sites fictifs et toutes les fonctionnalités, en un clic.
        </p>
        <FormAlert v-if="error" class="mx-auto mt-4 max-w-sm text-left">{{ error }}</FormAlert>
      </section>

      <!-- The real product, captured from the demo account (npm run capture). -->
      <figure class="mx-auto mt-14 max-w-6xl px-4 sm:mt-20 sm:px-8">
        <div class="rounded-2xl bg-brand-gradient p-px shadow-pop">
          <div class="overflow-hidden rounded-[15px] bg-surface">
            <img
              src="/screenshots/overview-light.jpg"
              width="2560"
              height="1600"
              fetchpriority="high"
              class="block h-auto w-full dark:hidden"
              alt="Vue d’ensemble d’un site dans Atollo : visiteurs uniques, visites, pages vues, taux de rebond et durée moyenne, courbe des 30 derniers jours comparée à la période précédente, sources et pages populaires."
            />
            <!-- Hidden images with loading="lazy" are not downloaded: one theme only. -->
            <img
              src="/screenshots/overview-dark.jpg"
              width="2560"
              height="1600"
              loading="lazy"
              class="hidden h-auto w-full dark:block"
              alt="Vue d’ensemble d’un site dans Atollo : visiteurs uniques, visites, pages vues, taux de rebond et durée moyenne, courbe des 30 derniers jours comparée à la période précédente, sources et pages populaires."
            />
          </div>
        </div>
        <figcaption class="mt-3 text-center text-xs text-fg-subtle">
          Capture réelle de la démo : un site fictif, sur 30 jours.
        </figcaption>
      </figure>

      <!-- Features -->
      <section
        id="fonctionnalites"
        class="mx-auto max-w-6xl scroll-mt-6 px-4 pt-24 sm:px-8 sm:pt-32"
        aria-labelledby="features-title"
      >
        <div class="max-w-2xl">
          <p class="text-label text-[10px] text-accent">Fonctionnalités</p>
          <h2 id="features-title" class="mt-3 text-3xl font-semibold tracking-tight text-balance">
            L’essentiel de votre audience, rien de superflu
          </h2>
          <p class="mt-3 text-fg-muted">
            Les chiffres qui comptent, au même endroit, sans menus à rallonge ni jargon.
          </p>
        </div>

        <ul class="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <li
            v-for="feature in features"
            :key="feature.title"
            class="rounded-xl border border-line bg-surface p-5 shadow-xs"
          >
            <span
              class="grid size-9 place-items-center rounded-lg border border-line bg-surface-muted"
            >
              <component :is="feature.icon" class="size-4.5 text-accent" aria-hidden="true" />
            </span>
            <h3 class="mt-4 text-[15px] font-semibold tracking-tight">{{ feature.title }}</h3>
            <p class="mt-1.5 text-[13px] text-fg-muted">{{ feature.text }}</p>
          </li>
        </ul>
      </section>

      <!-- Two closer looks at the product -->
      <section class="mx-auto flex max-w-6xl flex-col gap-16 px-4 pt-24 sm:px-8 sm:pt-32">
        <article
          v-for="(item, index) in showcases"
          :key="item.image"
          class="grid items-center gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-12"
        >
          <div :class="{ 'lg:order-2': index % 2 === 1 }">
            <h2 class="text-2xl font-semibold tracking-tight text-balance">{{ item.title }}</h2>
            <p class="mt-3 text-fg-muted">{{ item.text }}</p>
          </div>
          <div class="overflow-hidden rounded-xl border border-line bg-surface shadow-pop">
            <img
              :src="`/screenshots/${item.image}-light.jpg`"
              width="2560"
              height="1600"
              loading="lazy"
              class="block h-auto w-full dark:hidden"
              :alt="item.alt"
            />
            <img
              :src="`/screenshots/${item.image}-dark.jpg`"
              width="2560"
              height="1600"
              loading="lazy"
              class="hidden h-auto w-full dark:block"
              :alt="item.alt"
            />
          </div>
        </article>
      </section>

      <!-- For the curious (and the recruiters): how it is built -->
      <section
        id="technique"
        class="mx-auto max-w-6xl scroll-mt-6 px-4 pt-24 sm:px-8 sm:pt-32"
        aria-labelledby="tech-title"
      >
        <div
          class="grid gap-10 rounded-2xl border border-line bg-surface p-6 shadow-xs sm:p-10 lg:grid-cols-2"
        >
          <div>
            <p class="text-label text-[10px] text-accent">Sous le capot</p>
            <h2 id="tech-title" class="mt-3 text-3xl font-semibold tracking-tight text-balance">
              Un projet de portfolio, construit comme un vrai produit
            </h2>
            <ul class="mt-6 flex flex-wrap gap-2" aria-label="Technologies">
              <li
                v-for="tech in stack"
                :key="tech"
                class="rounded-md border border-line bg-surface-muted px-2 py-1 font-mono text-xs text-fg-muted"
              >
                {{ tech }}
              </li>
            </ul>
            <a
              :href="REPOSITORY"
              target="_blank"
              rel="noopener"
              :class="[
                linkButton,
                'mt-8 h-9 border border-line bg-surface px-4 text-[13px] shadow-xs hover:bg-surface-muted',
              ]"
            >
              <Code2 class="size-4" aria-hidden="true" />
              Voir le code sur GitHub
            </a>
          </div>
          <ul class="flex flex-col gap-4">
            <li v-for="point in engineering" :key="point" class="flex gap-3 text-[13px]">
              <span
                class="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-gradient"
                aria-hidden="true"
              />
              <span class="text-fg-muted">{{ point }}</span>
            </li>
          </ul>
        </div>
      </section>

      <!-- Last call -->
      <section
        class="mx-auto max-w-3xl px-4 pt-24 pb-24 text-center sm:px-8 sm:pt-32"
        aria-labelledby="cta-title"
      >
        <h2 id="cta-title" class="text-3xl font-semibold tracking-tight text-balance">
          Le plus simple, c’est d’essayer
        </h2>
        <p class="mt-3 text-fg-muted">
          Ni inscription ni e-mail : la démo s’ouvre en un clic, avec huit sites fictifs.
        </p>
        <div class="mt-8 flex justify-center">
          <RouterLink
            v-if="auth.isAuthenticated"
            :to="{ name: 'sites' }"
            :class="[linkButton, 'h-11 bg-fg px-5 text-sm text-canvas hover:bg-fg/90']"
          >
            Ouvrir mon tableau de bord
            <ArrowRight class="size-4" aria-hidden="true" />
          </RouterLink>
          <BaseButton v-else variant="primary" class="h-11 px-5 text-sm" :loading @click="openDemo">
            Explorer la démo
            <ArrowRight aria-hidden="true" />
          </BaseButton>
        </div>
      </section>
    </main>

    <footer class="border-t border-line">
      <div
        class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-fg-subtle sm:flex-row sm:px-8"
      >
        <p>Atollo · projet portfolio de Laura Dimitroff · aucune donnée réelle</p>
        <a :href="REPOSITORY" target="_blank" rel="noopener" class="hover:text-fg">
          Code source sur GitHub
        </a>
      </div>
    </footer>
  </div>
</template>
