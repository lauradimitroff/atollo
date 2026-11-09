<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import { RotateCcw } from '@lucide/vue'

import ChartLoadError from '@/shared/charts/ChartLoadError.vue'
import BaseButton from '@/shared/ui/BaseButton.vue'
import BaseSkeleton from '@/shared/ui/BaseSkeleton.vue'
import BreakdownCard from '../components/BreakdownCard.vue'
import KpiStrip from '../components/KpiStrip.vue'
import { DEVICES_TABS, LOCATIONS_TABS, PAGES_TABS, SOURCES_TABS } from '../overview-cards'
import { useAnalyticsQuery } from '../composables/useAnalyticsQuery'
import { usePeriod } from '../composables/usePeriod'
import { useSelectedMetric } from '../composables/useSelectedMetric'
import { analytics } from '../data'
import { METRICS } from '../domain/metrics'
import { bucketLabels, formatAxis, formatChangeBetween, formatMetric } from '../format'

// The chart pulls ECharts in: loaded as a separate chunk, after the KPIs.
// If that download fails, retry twice, then show an explicit error instead of a blank space.
const TimeseriesChart = defineAsyncComponent({
  loader: () => import('@/shared/charts/TimeseriesChart.vue'),
  loadingComponent: BaseSkeleton,
  errorComponent: ChartLoadError,
  onError: (error, retry, fail, attempts) => {
    if (attempts <= 2) return retry()
    // Visible in the browser console: tells whether it is a network or blocker issue.
    console.error('[Atollo] Le code du graphique n’a pas pu être chargé :', error)
    fail()
  },
})

const metric = useSelectedMetric()
const { granularity } = usePeriod()

const kpis = useAnalyticsQuery((q) => analytics.getKpis(q))
const series = useAnalyticsQuery(
  (q) => analytics.getTimeseries(q, metric.value),
  () => metric.value,
)

const GRANULARITY_LABEL = { hour: 'par heure', day: 'par jour', week: 'par semaine' } as const

const chartTitle = computed(
  () => `${METRICS[metric.value].label} ${GRANULARITY_LABEL[granularity.value]}`,
)

const chartPoints = computed(
  () =>
    series.data.value?.map((point) => ({
      ...bucketLabels(point.start, granularity.value),
      current: point.current,
      previous: point.previous,
    })) ?? [],
)

const key = computed(() => metric.value)
</script>

<template>
  <div class="flex flex-col gap-5">
    <section
      class="overflow-hidden rounded-xl border border-line bg-surface shadow-xs"
      aria-label="Tendance"
    >
      <KpiStrip v-model="metric" :kpis="kpis.data.value" :loading="kpis.loading.value" />

      <div class="flex flex-wrap items-center gap-x-5 gap-y-1 px-5 pt-4 text-xs text-fg-muted">
        <h2 class="mr-auto text-[13px] font-medium text-fg">{{ chartTitle }}</h2>
        <span class="inline-flex items-center gap-2">
          <i class="h-0.5 w-3.5 rounded-full bg-brand-gradient" aria-hidden="true" />
          Période sélectionnée
        </span>
        <span class="inline-flex items-center gap-2">
          <i class="w-3.5 border-t-2 border-dashed border-fg-subtle" aria-hidden="true" />
          Période précédente
        </span>
      </div>

      <div class="px-2 pt-2 pb-3 sm:px-3" :aria-busy="series.loading.value">
        <div
          v-if="series.error.value && !series.data.value"
          class="flex h-56 flex-col items-center justify-center gap-3 text-[13px] text-fg-muted sm:h-64"
          role="alert"
        >
          Impossible de charger le graphique.
          <BaseButton size="sm" @click="series.reload()">
            <RotateCcw aria-hidden="true" />Réessayer
          </BaseButton>
        </div>
        <BaseSkeleton v-else-if="!series.data.value" class="mx-3 my-2 h-52 sm:h-60" />
        <TimeseriesChart
          v-else
          :class="{ 'opacity-60 transition-opacity': series.loading.value }"
          :points="chartPoints"
          :title="chartTitle"
          current-label="Période sélectionnée"
          previous-label="Période précédente"
          :format-value="(v: number) => formatMetric(key, v)"
          :format-axis="(v: number) => formatAxis(key, v)"
          :format-change="(c: number, p: number) => formatChangeBetween(key, c, p)"
        />
      </div>
    </section>

    <div class="grid gap-5 lg:grid-cols-2">
      <BreakdownCard title="Sources" :tabs="SOURCES_TABS" />
      <BreakdownCard title="Pages" :tabs="PAGES_TABS" />
      <BreakdownCard title="Localisation" :tabs="LOCATIONS_TABS" />
      <BreakdownCard title="Appareils" :tabs="DEVICES_TABS" />
    </div>
  </div>
</template>
