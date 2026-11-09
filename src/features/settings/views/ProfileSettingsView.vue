<script setup lang="ts">
import { UserRound } from '@lucide/vue'

import EmptyState from '@/shared/ui/EmptyState.vue'
</script>

<template>
  <EmptyState
    :icon="UserRound"
    title="Profil à venir"
    description="Nom, avatar et adresse e-mail seront modifiables à l’étape 5, avec l’authentification."
  />
</template>
