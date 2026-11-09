<script setup lang="ts">
import { computed, useId } from 'vue'

/**
 * Label + hint + error message around a form control.
 * The control receives the ids it needs through slot props, so screen readers
 * announce the label, the hint and the error together.
 */
const props = defineProps<{
  label: string
  hint?: string
  error?: string
}>()

const id = useId()
const hintId = `${id}-hint`
const errorId = `${id}-error`

const describedBy = computed(
  () => [props.hint && hintId, props.error && errorId].filter(Boolean).join(' ') || undefined,
)
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label :for="id" class="text-[13px] font-medium">{{ label }}</label>
    <slot :id="id" :described-by="describedBy" :invalid="Boolean(error)" />
    <p v-if="error" :id="errorId" class="text-xs text-down" role="alert">{{ error }}</p>
    <p v-else-if="hint" :id="hintId" class="text-xs text-fg-muted">{{ hint }}</p>
  </div>
</template>
