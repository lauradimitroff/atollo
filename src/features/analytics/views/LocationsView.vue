<script setup lang="ts">
import { Globe } from '@lucide/vue'

import EmptyState from '@/shared/ui/EmptyState.vue'
</script>

<template>
  <EmptyState
    :icon="Globe"
    title="Géolocalisation à venir"
    description="La carte interactive et la répartition par pays arrivent à l’étape 4."
  />
</template>
