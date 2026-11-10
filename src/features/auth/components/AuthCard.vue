<script setup lang="ts">
/** Title + card + optional footer line, shared by the sign-in, sign-up and reset pages. */
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="text-center">
      <h1 class="text-xl font-semibold tracking-tight">{{ title }}</h1>
      <p v-if="description" class="mt-1.5 text-[13px] text-fg-muted">{{ description }}</p>
    </div>

    <!-- Content shown before the main card (the demo invitation on the sign-in page). -->
    <slot name="before" />

    <div class="rounded-xl border border-line bg-surface p-5 shadow-pop sm:p-6">
      <slot />
    </div>

    <p v-if="$slots.footer" class="text-center text-[13px] text-fg-muted">
      <slot name="footer" />
    </p>
  </div>
</template>
