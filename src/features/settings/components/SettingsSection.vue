<script setup lang="ts">
/** One block of settings: title and explanation, the fields, then the actions. */
defineProps<{
  title: string
  description?: string
  /** Irreversible actions (account deletion…). */
  danger?: boolean
}>()
</script>

<template>
  <section
    class="rounded-xl border bg-surface shadow-xs"
    :class="danger ? 'border-down/40' : 'border-line'"
    :aria-label="title"
  >
    <div class="grid gap-x-8 gap-y-4 p-5 md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]">
      <div>
        <h2 class="text-[13px] font-medium" :class="{ 'text-down': danger }">{{ title }}</h2>
        <p v-if="description" class="mt-1 text-[13px] text-fg-muted">{{ description }}</p>
      </div>
      <div class="flex min-w-0 flex-col gap-4">
        <slot />
      </div>
    </div>

    <footer
      v-if="$slots.footer"
      class="flex flex-wrap items-center justify-end gap-3 rounded-b-xl border-t px-5 py-3"
      :class="danger ? 'border-down/30 bg-down/5' : 'border-line bg-surface-muted/50'"
    >
      <slot name="footer" />
    </footer>
  </section>
</template>
