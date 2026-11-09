<script setup lang="ts">
/**
 * TEMPORARY (step 2c): shows the computed statistics and live consistency checks,
 * so the data layer can be validated by eye. Replaced by the real overview in step 3.
 */
import { computed } from 'vue'

import { formatNumber, formatPercent } from '@/shared/lib/format'
import { analytics } from '../data'
import { useAnalyticsQuery } from '../composables/useAnalyticsQuery'
import { CHANNEL_LABELS } from '../domain/labels'
import { changeSentiment, METRIC_KEYS, METRICS, type MetricKey } from '../domain/metrics'
import type { Channel } from '../domain/types'
import { formatChange, formatMetric } from '../format'

const kpis = useAnalyticsQuery((q) => analytics.getKpis(q))
const channels = useAnalyticsQuery((q) => analytics.getBreakdown(q, 'channel'))
const pages = useAnalyticsQuery((q) => analytics.getPages(q))
const series = useAnalyticsQuery((q) => analytics.getTimeseries(q, 'visits'))

const loading = computed(
  () => kpis.loading.value || channels.loading.value || pages.loading.value || series.loading.value,
)

const sum = (values: (number | null)[]) => values.reduce<number>((a, b) => a + (b ?? 0), 0)

const checks = computed(() => {
  if (!kpis.data.value || !channels.data.value || !pages.data.value || !series.data.value) return []
  const visits = kpis.data.value.visits.current
  const pageviews = kpis.data.value.pageviews.current
  return [
    {
      label: 'Visites par canal',
      left: sum(channels.data.value.map((c) => c.visits)),
      right: visits,
    },
    {
      label: 'Visites sur la courbe',
      left: sum(series.data.value.map((p) => p.current)),
      right: visits,
    },
    {
      label: 'Pages vues par page',
      left: sum(pages.data.value.map((p) => p.pageviews)),
      right: pageviews,
    },
    { label: 'Entrées par page', left: sum(pages.data.value.map((p) => p.entries)), right: visits },
  ]
})

function changeClass(key: MetricKey, change: number | null) {
  const sentiment = changeSentiment(key, change)
  return sentiment === 'good' ? 'text-up' : sentiment === 'bad' ? 'text-down' : 'text-fg-muted'
}
</script>

<template>
  <div class="flex flex-col gap-5" :aria-busy="loading">
    <p class="text-xs text-fg-subtle">
      Aperçu temporaire · étape 2c
      <span v-if="loading" class="ml-2 text-accent">chargement…</span>
    </p>

    <section class="overflow-x-auto rounded-xl border border-line bg-surface shadow-xs">
      <table class="w-full text-left text-[13px]">
        <caption class="border-b border-line px-5 py-3.5 text-left text-[13px] font-medium">
          Indicateurs clés
        </caption>
        <thead class="text-label text-[10px] text-fg-subtle">
          <tr>
            <th scope="col" class="px-5 py-2.5 font-medium">Métrique</th>
            <th scope="col" class="px-3 py-2.5 text-right font-medium">Période</th>
            <th scope="col" class="px-3 py-2.5 text-right font-medium">Précédente</th>
            <th scope="col" class="px-5 py-2.5 text-right font-medium">Évolution</th>
          </tr>
        </thead>
        <tbody v-if="kpis.data.value" class="divide-y divide-line">
          <tr v-for="key in METRIC_KEYS" :key="key">
            <th scope="row" class="px-5 py-2.5 font-normal">{{ METRICS[key].label }}</th>
            <td class="px-3 py-2.5 text-right font-mono">
              {{ formatMetric(key, kpis.data.value[key].current) }}
            </td>
            <td class="px-3 py-2.5 text-right font-mono text-fg-muted">
              {{ formatMetric(key, kpis.data.value[key].previous) }}
            </td>
            <td
              class="px-5 py-2.5 text-right font-mono"
              :class="changeClass(key, kpis.data.value[key].change)"
            >
              {{ formatChange(key, kpis.data.value[key].change) }}
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <div class="grid gap-5 lg:grid-cols-2">
      <section class="rounded-xl border border-line bg-surface shadow-xs">
        <h2 class="border-b border-line px-5 py-3.5 text-[13px] font-medium">Canaux</h2>
        <ul v-if="channels.data.value" class="px-3 py-2">
          <li
            v-for="row in channels.data.value"
            :key="row.key"
            class="relative flex justify-between px-2 py-1.5 text-[13px]"
          >
            <span
              class="absolute inset-y-0.5 left-0 -z-0 rounded-md bg-accent-soft"
              :style="{ width: `${row.share * 100}%` }"
              aria-hidden="true"
            />
            <span class="relative">{{ CHANNEL_LABELS[row.key as Channel] }}</span>
            <span class="relative font-mono">
              {{ formatNumber(row.visits) }}
              <span class="ml-3 inline-block w-14 text-right text-fg-muted">
                {{ formatPercent(row.share) }}
              </span>
            </span>
          </li>
        </ul>
      </section>

      <section class="rounded-xl border border-line bg-surface shadow-xs">
        <h2 class="border-b border-line px-5 py-3.5 text-[13px] font-medium">
          Contrôles de cohérence
        </h2>
        <ul class="divide-y divide-line px-5">
          <li
            v-for="check in checks"
            :key="check.label"
            class="flex items-center justify-between py-2.5 text-[13px]"
          >
            {{ check.label }}
            <span class="font-mono text-xs">
              {{ formatNumber(check.left) }} = {{ formatNumber(check.right) }}
              <span :class="check.left === check.right ? 'text-up' : 'text-down'">
                {{ check.left === check.right ? '✓' : '✗' }}
              </span>
            </span>
          </li>
          <li v-if="series.data.value" class="flex justify-between py-2.5 text-[13px]">
            Points sur la courbe
            <span class="font-mono text-xs">{{ series.data.value.length }}</span>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>
