<script setup lang="ts">
import ErrorState from '@/shared/ui/ErrorState.vue'

/**
 * Shown when the chart code itself cannot be downloaded (network drop, an ad blocker,
 * or an app update deployed while the tab was open). Reloading fetches the current version.
 */
function reload() {
  window.location.reload()
}
</script>

<template>
  <ErrorState
    class="h-56 sm:h-64"
    message="Le graphique n’a pas pu être chargé."
    action-label="Recharger la page"
    @retry="reload"
  />
</template>
