<script setup lang="ts">
import { computed } from 'vue'
import { ListFilter, RotateCcw, X } from '@lucide/vue'

import { formatNumber, formatPercent } from '@/shared/lib/format'
import BaseButton from '@/shared/ui/BaseButton.vue'
import BaseSkeleton from '@/shared/ui/BaseSkeleton.vue'
import { useAnalyticsQuery } from '../composables/useAnalyticsQuery'
import { useFilters } from '../composables/useFilters'
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

// Clicking a row filters the whole dashboard on it; clicking it again removes the filter.
const filters = useFilters()
const filterFor = (key: string) => ({ dimension: props.tab.filterDimension, value: key })
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
      <li v-for="row in rows" :key="row.key">
        <button
          type="button"
          class="group relative isolate flex h-9 w-full items-center gap-3 rounded-md px-2 text-left text-[13px] outline-offset-0"
          :aria-pressed="filters.isActive(filterFor(row.key))"
          :title="
            filters.isActive(filterFor(row.key))
              ? `Retirer le filtre ${row.label}`
              : `Filtrer sur ${row.label}`
          "
          @click="filters.toggle(filterFor(row.key))"
        >
          <span
            class="absolute inset-y-1 left-0 -z-10 rounded-md bg-accent-soft transition-[width,background-color] duration-300 ease-out group-hover:bg-accent/20 group-aria-pressed:bg-accent/30"
            :style="{ width: `${(row.value / max) * 100}%` }"
            aria-hidden="true"
          />
          <span
            class="min-w-0 flex-1 truncate group-aria-pressed:font-medium"
            :class="{ 'font-mono text-xs': row.mono }"
          >
            <span v-if="row.prefix" class="mr-1.5" aria-hidden="true">{{ row.prefix }}</span>
            {{ row.label }}
          </span>
          <!-- Hint on hover, close icon once active -->
          <X
            v-if="filters.isActive(filterFor(row.key))"
            class="size-3.5 shrink-0 text-fg-muted"
            aria-hidden="true"
          />
          <ListFilter
            v-else
            class="size-3.5 shrink-0 text-fg-subtle opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
            aria-hidden="true"
          />
          <span class="font-mono text-xs">{{ formatNumber(row.value) }}</span>
          <span v-if="row.share !== null" class="w-12 text-right font-mono text-xs text-fg-subtle">
            {{ formatPercent(row.share) }}
          </span>
        </button>
      </li>
    </ul>
  </div>
</template>
