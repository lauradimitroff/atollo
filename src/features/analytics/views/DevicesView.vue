<script setup lang="ts">
import { MonitorSmartphone } from '@lucide/vue'

import DetailComingSoon from '../components/DetailComingSoon.vue'
</script>

<template>
  <DetailComingSoon
    :icon="MonitorSmartphone"
    title="Analyse détaillée des appareils bientôt disponible"
    description="Répartition complète par appareil, navigateur et système. L’essentiel est déjà dans la carte Appareils de la vue d’ensemble."
  />
</template>
