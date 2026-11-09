<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{ name: string; size?: 'sm' | 'md' }>(), { size: 'md' })

const initial = computed(() => props.name.trim().charAt(0).toUpperCase())
</script>

<template>
  <!-- Initial letter for now; the real favicon can replace it later. -->
  <span
    class="grid shrink-0 place-items-center rounded-md border border-line bg-surface-muted font-semibold text-fg-muted"
    :class="size === 'sm' ? 'size-5 text-[10px]' : 'size-6 text-[11px]'"
    aria-hidden="true"
  >
    {{ initial }}
  </span>
</template>
