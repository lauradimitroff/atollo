<script setup lang="ts">
/**
 * Tiny trend line, hand-drawn in SVG: no axis, no tooltip, nothing to load.
 * Eight ECharts instances for eight site cards would weigh far more than this
 * ~40-line component. Decorative: the card states the actual numbers in text.
 */
import { computed, useId } from 'vue'

const props = withDefaults(defineProps<{ values: readonly number[]; height?: number }>(), {
  height: 40,
})

const WIDTH = 160
const PADDING = 2
const id = useId()

const paths = computed(() => {
  const values = props.values
  if (values.length < 2) return null

  const max = Math.max(...values, 1)
  const step = WIDTH / (values.length - 1)
  const y = (v: number) => PADDING + (1 - v / max) * (props.height - PADDING * 2)
  const points = values.map((v, i) => [i * step, y(v)] as const)

  const line = points
    .map(([x, py], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${py.toFixed(1)}`)
    .join(' ')
  return { line, area: `${line} L${WIDTH},${props.height} L0,${props.height} Z` }
})
</script>

<template>
  <svg
    :viewBox="`0 0 ${WIDTH} ${height}`"
    preserveAspectRatio="none"
    class="block w-full overflow-visible"
    :style="{ height: `${height}px` }"
    aria-hidden="true"
  >
    <defs>
      <linearGradient :id="`${id}-line`" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stop-color="var(--grad-a)" />
        <stop offset="0.5" stop-color="var(--grad-b)" />
        <stop offset="1" stop-color="var(--grad-c)" />
      </linearGradient>
      <linearGradient :id="`${id}-area`" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stop-color="var(--accent)" stop-opacity="var(--area-opacity)" />
        <stop offset="1" stop-color="var(--accent)" stop-opacity="0" />
      </linearGradient>
    </defs>
    <template v-if="paths">
      <path :d="paths.area" :fill="`url(#${id}-area)`" />
      <path
        :d="paths.line"
        fill="none"
        :stroke="`url(#${id}-line)`"
        stroke-width="1.75"
        stroke-linejoin="round"
        stroke-linecap="round"
        vector-effect="non-scaling-stroke"
      />
    </template>
    <!-- No data yet: a flat dashed baseline instead of an empty box. -->
    <line
      v-else
      x1="0"
      :x2="WIDTH"
      :y1="height - PADDING"
      :y2="height - PADDING"
      stroke="var(--line-strong)"
      stroke-dasharray="3 4"
      vector-effect="non-scaling-stroke"
    />
  </svg>
</template>
