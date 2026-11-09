<script setup lang="ts">
import { DropdownMenuItem } from 'reka-ui'

defineProps<{
  /** Destructive action (delete, sign out…): shown in the "down" color. */
  danger?: boolean
  disabled?: boolean
}>()

defineEmits<{ select: [event: Event] }>()
</script>

<template>
  <DropdownMenuItem
    :disabled="disabled"
    class="flex h-8 cursor-default items-center gap-2.5 rounded-lg px-2 text-[13px] outline-none select-none data-disabled:opacity-50 data-highlighted:bg-surface-muted [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-fg-muted"
    :class="danger ? 'text-down [&_svg]:text-down' : 'text-fg'"
    @select="$emit('select', $event)"
  >
    <slot />
  </DropdownMenuItem>
</template>
