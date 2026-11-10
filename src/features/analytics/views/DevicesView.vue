<script setup lang="ts">
/**
 * What visitors use: the device split, how each device behaves (bounce, duration,
 * depth), then every browser and every operating system. All of it is a cross filter.
 */
import { computed, type Component } from 'vue'
import { Monitor, Smartphone, Tablet } from '@lucide/vue'

import { formatDecimal, formatDuration, formatNumber, formatPercent } from '@/shared/lib/format'
import BaseSkeleton from '@/shared/ui/BaseSkeleton.vue'
import ErrorState from '@/shared/ui/ErrorState.vue'
import BreakdownTable, { type BreakdownTableRow } from '../components/BreakdownTable.vue'
import NoVisitsState from '../components/NoVisitsState.vue'
import { useAnalyticsQuery } from '../composables/useAnalyticsQuery'
import { useFilters } from '../composables/useFilters'
import { analytics } from '../data'
import { DEVICE_LABELS } from '../domain/labels'
import type { BreakdownRow, SegmentRow } from '../domain/metrics'
import type { Device } from '../domain/types'

const filters = useFilters()

const devices = useAnalyticsQuery((q) => analytics.getSegments(q, 'device'))
const browsers = useAnalyticsQuery((q) => analytics.getBreakdown(q, 'browser'))
const systems = useAnalyticsQuery((q) => analytics.getBreakdown(q, 'os'))

const isEmpty = computed(() => devices.data.value?.length === 0)

// Fixed order and colors, whatever the ranking: the bar and the tiles stay comparable
// from one period to the next.
const DEVICES: readonly { key: Device; icon: Component }[] = [
  { key: 'desktop', icon: Monitor },
  { key: 'mobile', icon: Smartphone },
  { key: 'tablet', icon: Tablet },
]

const tiles = computed(() => {
  const rows = new Map((devices.data.value ?? []).map((row) => [row.key, row]))
  return DEVICES.flatMap((device, index) => {
    const row = rows.get(device.key)
    return row ? [{ ...device, row, color: `var(--cat-${index + 1})` }] : []
  })
})

const deviceFilter = (device: Device) => ({ dimension: 'device' as const, value: device })

const pagesPerVisit = (row: SegmentRow) => (row.visits ? row.pageviews / row.visits : 0)

const asRows = (rows: BreakdownRow[] | null): BreakdownTableRow[] =>
  (rows ?? []).map((row) => ({ ...row, label: row.key }))
</script>

<template>
  <div class="flex flex-col gap-5">
    <section
      class="rounded-xl border border-line bg-surface shadow-xs"
      aria-labelledby="devices-title"
    >
      <header class="px-5 pt-4">
        <h2 id="devices-title" class="text-[13px] font-medium">Visites par appareil</h2>
        <p class="mt-1 text-xs text-fg-muted">
          Cliquez sur un appareil pour filtrer toute l’analyse.
        </p>
      </header>

      <div class="p-5">
        <ErrorState
          v-if="devices.error.value && !devices.data.value"
          class="h-56"
          message="La répartition par appareil n’a pas pu être chargée."
          @retry="devices.reload()"
        />
        <NoVisitsState v-else-if="isEmpty" bare />
        <div v-else-if="!devices.data.value" class="flex flex-col gap-4">
          <BaseSkeleton class="h-2.5" />
          <div class="grid gap-3 sm:grid-cols-3">
            <BaseSkeleton v-for="n in 3" :key="n" class="h-44" />
          </div>
        </div>

        <div
          v-else
          class="flex flex-col gap-4 transition-opacity"
          :class="{ 'opacity-60': devices.loading.value }"
          :aria-busy="devices.loading.value"
        >
          <!-- The whole split at a glance; the tiles below carry the exact figures. -->
          <div class="flex h-2.5 gap-0.5 overflow-hidden rounded-full" aria-hidden="true">
            <span
              v-for="tile in tiles"
              :key="tile.key"
              class="h-full transition-[width] duration-500"
              :style="{ width: `${tile.row.share * 100}%`, background: tile.color }"
            />
          </div>

          <ul class="grid gap-3 sm:grid-cols-3" aria-label="Appareils">
            <li v-for="tile in tiles" :key="tile.key">
              <button
                type="button"
                class="flex h-full w-full flex-col gap-4 rounded-lg border border-line p-4 text-left transition-colors hover:border-line-strong aria-pressed:border-accent aria-pressed:bg-accent-soft"
                :aria-pressed="filters.isActive(deviceFilter(tile.key))"
                @click="filters.toggle(deviceFilter(tile.key))"
              >
                <span class="flex items-center gap-2 text-[13px] font-medium">
                  <span
                    class="grid size-7 place-items-center rounded-md"
                    :style="{
                      color: tile.color,
                      background: `color-mix(in srgb, ${tile.color} 14%, transparent)`,
                    }"
                  >
                    <component :is="tile.icon" class="size-4" aria-hidden="true" />
                  </span>
                  {{ DEVICE_LABELS[tile.key] }}
                </span>

                <span>
                  <span class="block font-mono text-2xl tracking-tight">
                    {{ formatPercent(tile.row.share) }}
                  </span>
                  <span class="mt-0.5 block text-xs text-fg-muted">
                    {{ formatNumber(tile.row.visits) }} visites ·
                    {{ formatNumber(tile.row.visitors) }} visiteurs
                  </span>
                </span>

                <dl class="flex justify-between gap-3 border-t border-line pt-3 text-xs">
                  <div>
                    <dt class="text-fg-muted">Rebond</dt>
                    <dd class="mt-0.5 font-mono whitespace-nowrap">
                      {{ formatPercent(tile.row.bounceRate) }}
                    </dd>
                  </div>
                  <div>
                    <dt class="text-fg-muted">Durée</dt>
                    <dd class="mt-0.5 font-mono whitespace-nowrap">
                      {{ formatDuration(tile.row.avgDuration) }}
                    </dd>
                  </div>
                  <div>
                    <dt class="text-fg-muted">Pages/visite</dt>
                    <dd class="mt-0.5 font-mono whitespace-nowrap">
                      {{ formatDecimal(pagesPerVisit(tile.row)) }}
                    </dd>
                  </div>
                </dl>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- min-w-0: grid items never shrink below their content otherwise (see TrafficView). -->
    <div v-if="!isEmpty" class="grid gap-5 lg:grid-cols-2">
      <section
        v-for="block in [
          {
            id: 'browsers',
            title: 'Navigateurs',
            hint: 'Navigateur utilisé pour la visite.',
            column: 'Navigateur',
            dimension: 'browser' as const,
            query: browsers,
          },
          {
            id: 'systems',
            title: 'Systèmes d’exploitation',
            hint: 'Système de l’ordinateur, du téléphone ou de la tablette.',
            column: 'Système',
            dimension: 'os' as const,
            query: systems,
          },
        ]"
        :key="block.id"
        class="min-w-0 rounded-xl border border-line bg-surface shadow-xs"
        :aria-labelledby="`${block.id}-title`"
      >
        <header class="border-b border-line px-5 py-3.5">
          <h2 :id="`${block.id}-title`" class="text-[13px] font-medium">{{ block.title }}</h2>
          <p class="mt-0.5 text-xs text-fg-muted">{{ block.hint }}</p>
        </header>
        <ErrorState
          v-if="block.query.error.value && !block.query.data.value"
          class="h-48"
          @retry="block.query.reload()"
        />
        <div v-else-if="!block.query.data.value" class="flex flex-col gap-3 p-5">
          <BaseSkeleton v-for="n in 5" :key="n" class="h-6" />
        </div>
        <BreakdownTable
          v-else
          :rows="asRows(block.query.data.value)"
          :column-label="block.column"
          :filter-dimension="block.dimension"
          :loading="block.query.loading.value"
        />
      </section>
    </div>
  </div>
</template>
