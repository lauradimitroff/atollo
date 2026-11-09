<script setup lang="ts">
import { Globe } from '@lucide/vue'

import EmptyState from '@/shared/ui/EmptyState.vue'
</script>

<template>
  <EmptyState
    :icon="Globe"
    title="Gestion des sites à venir"
    description="Ajout, modification et suppression des sites arrivent à l’étape 5."
  />
</template>
