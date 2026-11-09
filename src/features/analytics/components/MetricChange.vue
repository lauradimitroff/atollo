<script setup lang="ts">
import { computed } from 'vue'
import { ArrowDownRight, ArrowRight, ArrowUpRight } from '@lucide/vue'

import { changeSentiment, type MetricKey } from '../domain/metrics'
import { formatChange } from '../format'

/** "↗ +12,4 %" in green, "↘ +2,6 pts" in red for the bounce rate, "→ 0 %" in grey. */
const props = defineProps<{ metric: MetricKey; change: number | null }>()

const sentiment = computed(() => changeSentiment(props.metric, props.change))
const icon = computed(() => {
  if (sentiment.value === null) return ArrowRight
  return (props.change ?? 0) > 0 ? ArrowUpRight : ArrowDownRight
})
const label = computed(() => formatChange(props.metric, props.change).replace('-', '−'))
</script>

<template>
  <span
    class="inline-flex items-center gap-0.5 font-mono text-xs"
    :class="{
      'text-up': sentiment === 'good',
      'text-down': sentiment === 'bad',
      'text-fg-subtle': sentiment === null,
    }"
  >
    <component
      :is="icon"
      v-if="change !== null"
      class="size-3.5"
      stroke-width="2.25"
      aria-hidden="true"
    />
    {{ label }}
    <span class="sr-only">par rapport à la période précédente</span>
  </span>
</template>
