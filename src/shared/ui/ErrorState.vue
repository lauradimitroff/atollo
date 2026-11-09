<script setup lang="ts">
import { CircleAlert, RotateCcw } from '@lucide/vue'

import BaseButton from './BaseButton.vue'

/**
 * The one way to say "this part failed" across the app: same icon, same tone,
 * always a way out. `role="alert"` makes screen readers announce it.
 * Size it from the parent (e.g. class="h-56") so the layout does not jump.
 */
withDefaults(
  defineProps<{
    message?: string
    actionLabel?: string
  }>(),
  {
    message: 'Ces données n’ont pas pu être chargées.',
    actionLabel: 'Réessayer',
  },
)

defineEmits<{ retry: [] }>()
</script>

<template>
  <div
    class="flex flex-col items-center justify-center gap-3 px-4 text-center text-[13px] text-fg-muted"
    role="alert"
  >
    <CircleAlert class="size-5 text-down" aria-hidden="true" />
    <p>{{ message }}</p>
    <BaseButton size="sm" @click="$emit('retry')">
      <RotateCcw aria-hidden="true" />{{ actionLabel }}
    </BaseButton>
  </div>
</template>
