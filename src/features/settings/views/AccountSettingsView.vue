<script setup lang="ts">
import { KeyRound } from '@lucide/vue'

import EmptyState from '@/shared/ui/EmptyState.vue'
</script>

<template>
  <EmptyState
    :icon="KeyRound"
    title="Compte à venir"
    description="Mot de passe et suppression du compte arrivent à l’étape 5."
  />
</template>
