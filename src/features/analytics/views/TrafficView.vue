<script setup lang="ts">
import { Activity } from '@lucide/vue'

import DetailComingSoon from '../components/DetailComingSoon.vue'
</script>

<template>
  <DetailComingSoon
    :icon="Activity"
    title="Analyse détaillée du trafic bientôt disponible"
    description="Courbe par canal et tableaux complets des référents et des campagnes. L’essentiel est déjà dans la carte Sources de la vue d’ensemble."
  />
</template>
