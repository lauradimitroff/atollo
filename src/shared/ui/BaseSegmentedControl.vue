<script setup lang="ts" generic="T extends string">
import { RadioGroupItem, RadioGroupRoot } from 'reka-ui'

/**
 * A row of mutually exclusive options (period presets, theme…).
 * Built on Reka's RadioGroup: arrow keys move the selection and screen readers
 * announce "radio, 2 of 4, checked". Generic, so v-model keeps its exact type.
 */
defineProps<{
  options: readonly { value: T; label: string }[]
  /** Accessible name of the group, e.g. "Période". */
  label: string
}>()

const model = defineModel<T>({ required: true })

// Reka types the value loosely; the options passed in guarantee it is a T.
function onUpdate(value: unknown) {
  model.value = value as T
}
</script>

<template>
  <RadioGroupRoot
    :model-value="model"
    :aria-label="label"
    orientation="horizontal"
    loop
    class="inline-flex rounded-lg border border-line bg-surface p-0.5 shadow-xs"
    @update:model-value="onUpdate"
  >
    <RadioGroupItem
      v-for="option in options"
      :key="option.value"
      :value="option.value"
      class="rounded-md px-2.5 py-1 text-[13px] whitespace-nowrap text-fg-muted transition-colors hover:text-fg focus-visible:outline-offset-0 data-[state=checked]:bg-surface-muted data-[state=checked]:font-medium data-[state=checked]:text-fg data-[state=checked]:shadow-[inset_0_0_0_1px_var(--line)]"
    >
      {{ option.label }}
    </RadioGroupItem>
  </RadioGroupRoot>
</template>
