<script setup lang="ts">
import { RotateCcw } from '@lucide/vue'

import BaseButton from '@/shared/ui/BaseButton.vue'

/**
 * Shown when the chart code itself cannot be downloaded (network drop, or an app
 * update deployed while the tab was open). Reloading fetches the current version.
 */
function reload() {
  window.location.reload()
}
</script>

<template>
  <div
    class="flex h-56 flex-col items-center justify-center gap-3 text-[13px] text-fg-muted sm:h-64"
    role="alert"
  >
    Le graphique n’a pas pu être chargé.
    <BaseButton size="sm" @click="reload"
      ><RotateCcw aria-hidden="true" />Recharger la page</BaseButton
    >
  </div>
</template>
