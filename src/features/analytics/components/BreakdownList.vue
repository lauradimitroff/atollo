<script setup lang="ts">
import { computed } from 'vue'
import { RotateCcw } from '@lucide/vue'

import { formatNumber, formatPercent } from '@/shared/lib/format'
import BaseButton from '@/shared/ui/BaseButton.vue'
import BaseSkeleton from '@/shared/ui/BaseSkeleton.vue'
import { useAnalyticsQuery } from '../composables/useAnalyticsQuery'
import type { BreakdownTab } from './breakdown'

/**
 * The rows of one tab. Mounted only while its tab is active, so a card loads
 * only what is shown (Reka's TabsContent unmounts hidden tabs).
 */
const props = withDefaults(defineProps<{ tab: BreakdownTab; limit?: number }>(), { limit: 6 })

const { data, loading, error, reload } = useAnalyticsQuery((q) => props.tab.load(q))

const rows = computed(() => data.value?.slice(0, props.limit) ?? [])
// Bars are relative to the largest row: the top row always fills the width.
const max = computed(() => Math.max(1, ...rows.value.map((r) => r.value)))
const showShare = computed(() => rows.value.some((r) => r.share !== null))
</script>

<template>
  <div
    class="flex items-center justify-between px-5 pt-3 pb-1 text-label text-[10px] text-fg-subtle"
  >
    <span>{{ tab.columnLabel }}</span>
    <span class="flex gap-3">
      {{ tab.valueLabel }}
      <!-- Keeps the header above the numbers, not above the percentages. -->
      <span v-if="showShare" class="w-12" aria-hidden="true" />
    </span>
  </div>

  <!-- Fixed height (limit × row height): switching tab or period never makes the page jump. -->
  <div class="px-3 pb-3" :style="{ minHeight: `${limit * 2.25 + 0.75}rem` }" :aria-busy="loading">
    <div
      v-if="error && !data"
      class="flex h-40 flex-col items-center justify-center gap-3 text-[13px] text-fg-muted"
      role="alert"
    >
      Impossible de charger ces données.
      <BaseButton size="sm" @click="reload()"><RotateCcw aria-hidden="true" />Réessayer</BaseButton>
    </div>

    <ul v-else-if="!data" aria-label="Chargement">
      <li v-for="n in limit" :key="n" class="flex h-9 items-center justify-between px-2">
        <BaseSkeleton class="h-3" :style="{ width: `${70 - n * 8}%` }" />
        <BaseSkeleton class="h-3 w-10" />
      </li>
    </ul>

    <p
      v-else-if="rows.length === 0"
      class="flex h-40 items-center justify-center text-[13px] text-fg-muted"
    >
      Aucune donnée sur cette période.
    </p>

    <ul v-else class="transition-opacity" :class="{ 'opacity-60': loading }">
      <li
        v-for="row in rows"
        :key="row.key"
        class="relative isolate flex h-9 items-center gap-3 px-2 text-[13px]"
      >
        <span
          class="absolute inset-y-1 left-0 -z-10 rounded-md bg-accent-soft transition-[width] duration-300 ease-out"
          :style="{ width: `${(row.value / max) * 100}%` }"
          aria-hidden="true"
        />
        <span
          class="min-w-0 flex-1 truncate"
          :class="{ 'font-mono text-xs': row.mono }"
          :title="row.label"
        >
          <span v-if="row.prefix" class="mr-1.5" aria-hidden="true">{{ row.prefix }}</span>
          {{ row.label }}
        </span>
        <span class="font-mono text-xs">{{ formatNumber(row.value) }}</span>
        <span v-if="row.share !== null" class="w-12 text-right font-mono text-xs text-fg-subtle">
          {{ formatPercent(row.share) }}
        </span>
      </li>
    </ul>
  </div>
</template>
