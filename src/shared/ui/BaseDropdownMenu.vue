<script setup lang="ts">
import {
  DropdownMenuContent,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from 'reka-ui'

/**
 * Styled wrapper around Reka's DropdownMenu.
 * Reka handles focus trapping, keyboard navigation (arrows, Home/End, typeahead),
 * Escape to close and positioning; this component only adds the Atollo look.
 *
 * Usage:
 *   <BaseDropdownMenu>
 *     <template #trigger><BaseButton>Ouvrir</BaseButton></template>
 *     <BaseDropdownMenuItem @select="…">Action</BaseDropdownMenuItem>
 *   </BaseDropdownMenu>
 */
withDefaults(
  defineProps<{
    align?: 'start' | 'center' | 'end'
    /** Make the menu as wide as its trigger (e.g. the site switcher). */
    matchTriggerWidth?: boolean
  }>(),
  { align: 'start' },
)
</script>

<template>
  <DropdownMenuRoot :modal="false">
    <DropdownMenuTrigger as-child>
      <slot name="trigger" />
    </DropdownMenuTrigger>

    <DropdownMenuPortal>
      <DropdownMenuContent
        :align="align"
        :side-offset="6"
        class="z-50 min-w-48 rounded-xl border border-line bg-surface p-1 shadow-pop data-[state=open]:motion-safe:animate-[menu-in_120ms_ease-out]"
        :class="{ 'w-(--reka-dropdown-menu-trigger-width)': matchTriggerWidth }"
      >
        <slot />
      </DropdownMenuContent>
    </DropdownMenuPortal>
  </DropdownMenuRoot>
</template>

<style>
@keyframes menu-in {
  from {
    opacity: 0;
    transform: translateY(-4px) scale(0.98);
  }
}
</style>
