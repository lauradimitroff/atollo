<script setup lang="ts">
import AppLogo from './AppLogo.vue'
import ThemeMenu from './ThemeMenu.vue'

/** Shell of the signed-out pages: logo, theme, one centered card. */
</script>

<template>
  <div class="relative isolate flex min-h-dvh flex-col overflow-hidden bg-canvas">
    <!-- A faint glow of the brand gradient behind the card; decoration only. -->
    <div
      class="pointer-events-none absolute top-[-14rem] left-1/2 -z-10 size-[36rem] -translate-x-1/2 rounded-full bg-brand-gradient opacity-[0.13] blur-3xl dark:opacity-[0.16]"
      aria-hidden="true"
    />

    <header class="flex items-center justify-between px-5 py-4 sm:px-8">
      <RouterLink to="/" class="rounded-md" aria-label="Atollo, accueil">
        <AppLogo />
      </RouterLink>
      <ThemeMenu />
    </header>

    <main class="flex flex-1 justify-center px-4 pt-6 pb-12 sm:items-center sm:pt-0">
      <div class="w-full max-w-sm">
        <RouterView />
      </div>
    </main>

    <footer class="px-5 pb-6 text-center text-xs text-fg-subtle">
      Atollo · projet de démonstration, aucune donnée réelle
    </footer>
  </div>
</template>
