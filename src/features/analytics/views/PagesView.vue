<script setup lang="ts">
import { FileText } from '@lucide/vue'

import DetailComingSoon from '../components/DetailComingSoon.vue'
</script>

<template>
  <DetailComingSoon
    :icon="FileText"
    title="Analyse détaillée des pages bientôt disponible"
    description="Tableau complet, triable et filtrable, avec temps moyen et taux de sortie. L’essentiel est déjà dans la carte Pages de la vue d’ensemble."
  />
</template>
