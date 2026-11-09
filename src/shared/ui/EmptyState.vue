<script setup lang="ts">
import type { Component } from 'vue'

/**
 * Placeholder for "nothing to show yet": no data, no site, page to come…
 * The subtle dot grid is part of the Atollo identity for empty states.
 */
defineProps<{
  icon: Component
  title: string
  description?: string
}>()
</script>

<template>
  <div
    class="relative flex flex-col items-center overflow-hidden rounded-xl border border-dashed border-line-strong bg-surface px-6 py-16 text-center"
  >
    <div
      class="pointer-events-none absolute inset-0 [background-image:radial-gradient(var(--line-strong)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)] [background-size:16px_16px] opacity-60"
      aria-hidden="true"
    />
    <span
      class="relative grid size-11 place-items-center rounded-xl border border-line bg-surface shadow-xs"
    >
      <component :is="icon" class="size-5 text-accent" aria-hidden="true" />
    </span>
    <h2 class="relative mt-4 text-[15px] font-semibold tracking-tight">{{ title }}</h2>
    <p v-if="description" class="relative mt-1.5 max-w-sm text-[13px] text-fg-muted">
      {{ description }}
    </p>
    <div v-if="$slots.default" class="relative mt-5 flex flex-wrap justify-center gap-2">
      <slot />
    </div>
  </div>
</template>
