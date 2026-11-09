<script setup lang="ts">
import { FileText } from '@lucide/vue'

import EmptyState from '@/shared/ui/EmptyState.vue'
</script>

<template>
  <EmptyState
    :icon="FileText"
    title="Analyse des pages à venir"
    description="Le tableau triable des pages les plus consultées arrive à l’étape 4."
  />
</template>
