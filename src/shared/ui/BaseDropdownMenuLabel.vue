<script setup lang="ts">
import { DropdownMenuLabel, DropdownMenuSeparator } from 'reka-ui'

/** Group title inside a dropdown, optionally preceded by a separator line. */
defineProps<{ separated?: boolean }>()
</script>

<template>
  <DropdownMenuSeparator v-if="separated" class="mx-1 my-1 h-px bg-line" />
  <DropdownMenuLabel class="px-2 pt-2 pb-1 text-label text-[10px] text-fg-subtle">
    <slot />
  </DropdownMenuLabel>
</template>
