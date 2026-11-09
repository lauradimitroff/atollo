<script setup lang="ts">
import type { Component } from 'vue'
import { useRoute } from 'vue-router'

import EmptyState from '@/shared/ui/EmptyState.vue'

/** Placeholder of a detail page, pointing to the overview where the data already is. */
defineProps<{ icon: Component; title: string; description: string }>()

const route = useRoute()
</script>

<template>
  <EmptyState :icon :title :description>
    <!-- Keeps the period and the filters on the way back. -->
    <RouterLink
      :to="{ name: 'overview', params: route.params, query: route.query }"
      class="inline-flex h-8 items-center rounded-lg bg-fg px-3 text-[13px] font-medium text-canvas transition-colors hover:bg-fg/90"
    >
      Voir la vue d’ensemble
    </RouterLink>
  </EmptyState>
</template>
