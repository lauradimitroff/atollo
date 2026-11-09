<script setup lang="ts">
const model = defineModel<string>({ default: '' })

defineProps<{
  invalid?: boolean
}>()
</script>

<template>
  <!-- Native attributes (id, type, placeholder, aria-describedby…) fall through to <input>. -->
  <input
    v-model="model"
    :aria-invalid="invalid || undefined"
    class="h-9 w-full rounded-lg border border-line bg-surface px-3 text-sm text-fg shadow-xs transition-colors placeholder:text-fg-subtle hover:border-line-strong focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-accent-soft focus-visible:outline-none disabled:opacity-50 aria-invalid:border-down"
  />
</template>
