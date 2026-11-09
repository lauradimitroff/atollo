<script setup lang="ts">
import { Globe } from '@lucide/vue'

import DetailComingSoon from '../components/DetailComingSoon.vue'
</script>

<template>
  <DetailComingSoon
    :icon="Globe"
    title="Carte des visiteurs bientôt disponible"
    description="Carte interactive et répartition complète par pays et par ville. L’essentiel est déjà dans la carte Localisation de la vue d’ensemble."
  />
</template>
