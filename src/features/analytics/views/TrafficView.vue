<script setup lang="ts">
import { Activity } from '@lucide/vue'

import EmptyState from '@/shared/ui/EmptyState.vue'
</script>

<template>
  <EmptyState
    :icon="Activity"
    title="Analyse du trafic à venir"
    description="Sources, sites référents et campagnes marketing arrivent à l’étape 4."
  />
</template>
