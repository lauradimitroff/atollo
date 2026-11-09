<script setup lang="ts">
import { RadioGroupItem, RadioGroupRoot } from 'reka-ui'

import BaseSkeleton from '@/shared/ui/BaseSkeleton.vue'
import { METRIC_KEYS, METRICS, type Kpis, type MetricKey } from '../domain/metrics'
import { formatMetric } from '../format'
import MetricChange from './MetricChange.vue'

/**
 * The five key metrics in one segmented band (no colored cards).
 * Clicking a metric shows it on the chart: semantically a choice among options,
 * hence a radio group: arrow keys move between metrics, as in any radio group.
 */
defineProps<{
  kpis: Kpis | null
  /** True while reloading: the previous numbers stay visible, slightly dimmed. */
  loading: boolean
}>()

const selected = defineModel<MetricKey>({ required: true })

function onUpdate(value: unknown) {
  selected.value = value as MetricKey
}
</script>

<template>
  <RadioGroupRoot
    :model-value="selected"
    aria-label="Métrique affichée sur le graphique"
    orientation="horizontal"
    loop
    class="grid grid-cols-2 gap-px border-b border-line bg-line md:grid-cols-5"
    @update:model-value="onUpdate"
  >
    <RadioGroupItem
      v-for="key in METRIC_KEYS"
      :key="key"
      :value="key"
      class="group relative bg-surface px-4 pt-4 pb-4 text-left outline-offset-[-2px] transition-colors last:col-span-2 hover:bg-surface-muted/50 md:px-5 md:last:col-span-1"
    >
      <!-- Signature gradient line on the selected metric -->
      <span
        class="absolute inset-x-4 -top-px h-0.5 rounded-b-sm bg-brand-gradient opacity-0 transition-opacity group-data-[state=checked]:opacity-100 md:inset-x-5"
        aria-hidden="true"
      />
      <span class="block text-label text-[10px] group-data-[state=checked]:text-fg">
        {{ METRICS[key].label }}
      </span>

      <template v-if="kpis">
        <span
          class="mt-2.5 mb-1.5 block font-mono text-2xl leading-none font-medium tracking-tight transition-opacity md:text-[26px]"
          :class="{ 'opacity-50': loading }"
        >
          {{ formatMetric(key, kpis[key].current) }}
        </span>
        <MetricChange :metric="key" :change="kpis[key].change" />
      </template>
      <template v-else>
        <BaseSkeleton class="mt-2.5 mb-2 h-6 w-24" />
        <BaseSkeleton class="h-3 w-12" />
      </template>
    </RadioGroupItem>
  </RadioGroupRoot>
</template>
