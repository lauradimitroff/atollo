<script setup lang="ts">
import { X } from '@lucide/vue'
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from 'reka-ui'

import BaseButton from './BaseButton.vue'

/**
 * Modal window for a short task (edit a site, copy a code). Reka's Dialog traps focus,
 * closes on Escape or a click outside, and gives focus back to the trigger.
 * Destructive confirmations use an AlertDialog instead, which a click outside
 * does not close.
 */
defineProps<{ title: string; description?: string }>()
const open = defineModel<boolean>('open', { default: false })
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogTrigger v-if="$slots.trigger" as-child>
      <slot name="trigger" />
    </DialogTrigger>

    <DialogPortal>
      <DialogOverlay
        class="fixed inset-0 z-40 bg-fg/30 backdrop-blur-[2px] motion-safe:data-[state=open]:animate-[fade-in_150ms_ease-out]"
      />
      <DialogContent
        class="fixed top-1/2 left-1/2 z-50 max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-line bg-surface p-5 shadow-pop sm:p-6"
        v-bind="description ? {} : { 'aria-describedby': undefined }"
      >
        <div class="flex items-start justify-between gap-4">
          <DialogTitle class="text-base font-semibold tracking-tight">{{ title }}</DialogTitle>
          <DialogClose as-child>
            <BaseButton variant="ghost" size="sm" icon-only aria-label="Fermer" class="-mt-1 -mr-2">
              <X aria-hidden="true" />
            </BaseButton>
          </DialogClose>
        </div>
        <DialogDescription v-if="description" class="mt-2 text-[13px] text-fg-muted">
          {{ description }}
        </DialogDescription>
        <div class="mt-5">
          <slot />
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
