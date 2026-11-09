<script setup lang="ts">
import { SearchX } from '@lucide/vue'

import EmptyState from '@/shared/ui/EmptyState.vue'
</script>

<template>
  <EmptyState
    :icon="SearchX"
    title="Cette page n’existe pas"
    description="L’adresse est peut-être erronée, ou le site demandé ne fait pas partie de votre espace."
  >
    <RouterLink
      :to="{ name: 'sites' }"
      class="inline-flex h-8 items-center rounded-lg bg-fg px-3 text-[13px] font-medium text-canvas transition-colors hover:bg-fg/90"
    >
      Voir mes sites
    </RouterLink>
  </EmptyState>
</template>
