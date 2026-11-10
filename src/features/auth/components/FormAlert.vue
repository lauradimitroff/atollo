<script setup lang="ts">
import { CircleAlert, CircleCheck } from '@lucide/vue'

/** Message about the whole form (wrong password, e-mail sent…), announced when it appears. */
defineProps<{ tone?: 'error' | 'success' }>()
</script>

<template>
  <div
    :role="tone === 'success' ? 'status' : 'alert'"
    class="flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-[13px]"
    :class="
      tone === 'success' ? 'border-up/30 bg-up/8 text-fg' : 'border-down/30 bg-down/8 text-fg'
    "
  >
    <CircleCheck
      v-if="tone === 'success'"
      class="mt-px size-4 shrink-0 text-up"
      aria-hidden="true"
    />
    <CircleAlert v-else class="mt-px size-4 shrink-0 text-down" aria-hidden="true" />
    <span><slot /></span>
  </div>
</template>
