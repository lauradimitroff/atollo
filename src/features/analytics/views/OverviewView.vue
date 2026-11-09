<script setup lang="ts">
import { LayoutGrid } from '@lucide/vue'

import EmptyState from '@/shared/ui/EmptyState.vue'
</script>

<template>
  <EmptyState
    :icon="LayoutGrid"
    title="Vue d’ensemble à venir"
    description="Indicateurs clés, évolution du trafic et comparaison avec la période précédente arrivent à l’étape 3."
  />
</template>
