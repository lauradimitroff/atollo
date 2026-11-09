<script setup lang="ts">
import { MonitorSmartphone } from '@lucide/vue'

import EmptyState from '@/shared/ui/EmptyState.vue'
</script>

<template>
  <EmptyState
    :icon="MonitorSmartphone"
    title="Appareils à venir"
    description="La répartition par appareil, navigateur et système arrive à l’étape 4."
  />
</template>
