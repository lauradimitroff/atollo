<script setup lang="ts">
/**
 * Where visits come from: the channel mix over time, then every referring site and
 * every marketing campaign. Every row and legend item is a cross filter.
 */
import { computed } from 'vue'

import { lazyChart } from '@/shared/charts/lazyChart'
import { formatPercent } from '@/shared/lib/format'
import BaseSkeleton from '@/shared/ui/BaseSkeleton.vue'
import ErrorState from '@/shared/ui/ErrorState.vue'
import BreakdownTable, { type BreakdownTableRow } from '../components/BreakdownTable.vue'
import NoVisitsState from '../components/NoVisitsState.vue'
import { useAnalyticsQuery } from '../composables/useAnalyticsQuery'
import { useFilters } from '../composables/useFilters'
import { usePeriod } from '../composables/usePeriod'
import { analytics } from '../data'
import { CHANNEL_LABELS } from '../domain/labels'
import { CHANNELS, type BreakdownRow } from '../domain/metrics'
import type { Channel } from '../domain/types'
import { bucketLabels, formatAxis, formatMetric } from '../format'

const StackedAreaChart = lazyChart(() => import('@/shared/charts/StackedAreaChart.vue'))

const { granularity } = usePeriod()
const filters = useFilters()

const series = useAnalyticsQuery((q) => analytics.getChannelTimeseries(q))
const channels = useAnalyticsQuery((q) => analytics.getBreakdown(q, 'channel'))
const referrers = useAnalyticsQuery((q) => analytics.getBreakdown(q, 'referrer'))
const campaigns = useAnalyticsQuery((q) => analytics.getBreakdown(q, 'campaign'))

const isEmpty = computed(() => channels.data.value?.length === 0)

/** Each channel keeps the same color everywhere, whatever its rank. */
const colorIndex = (channel: Channel) => CHANNELS.indexOf(channel)

// Largest channel at the bottom of the stack, where it reads best.
const chartSeries = computed(() =>
  (channels.data.value ?? []).map((row) => {
    const channel = row.key as Channel
    return {
      name: CHANNEL_LABELS[channel],
      colorIndex: colorIndex(channel),
      values: (series.data.value ?? []).map((p) => (p.visits ? p.visits[channel] : null)),
    }
  }),
)

const categories = computed(() =>
  (series.data.value ?? []).map((p) => bucketLabels(p.start, granularity.value)),
)

const GRANULARITY_LABEL = {
  hour: 'par heure',
  day: 'par jour',
  week: 'par semaine',
  month: 'par mois',
} as const

const asRows = (rows: BreakdownRow[] | null, mono = true): BreakdownTableRow[] =>
  (rows ?? []).map((row) => ({ ...row, label: row.key, mono }))

const channelFilter = (channel: string) => ({ dimension: 'channel' as const, value: channel })
</script>

<template>
  <div class="flex flex-col gap-5">
    <section class="rounded-xl border border-line bg-surface shadow-xs" aria-labelledby="mix-title">
      <header class="flex flex-wrap items-start justify-between gap-x-6 gap-y-3 px-5 pt-4">
        <div>
          <h2 id="mix-title" class="text-[13px] font-medium">
            Visites par canal {{ GRANULARITY_LABEL[granularity] }}
          </h2>
          <p class="mt-1 text-xs text-fg-muted">
            Cliquez sur un canal pour filtrer toute l’analyse.
          </p>
        </div>

        <!-- Legend = channel filters, with each channel's share of visits. -->
        <ul v-if="channels.data.value?.length" class="flex flex-wrap gap-1.5" aria-label="Canaux">
          <li v-for="row in channels.data.value" :key="row.key">
            <button
              type="button"
              class="inline-flex h-7 items-center gap-2 rounded-full border border-line px-2.5 text-xs transition-colors hover:border-line-strong aria-pressed:border-accent aria-pressed:bg-accent-soft"
              :aria-pressed="filters.isActive(channelFilter(row.key))"
              @click="filters.toggle(channelFilter(row.key))"
            >
              <i
                class="size-2 rounded-sm"
                :style="{ background: `var(--cat-${colorIndex(row.key as Channel) + 1})` }"
                aria-hidden="true"
              />
              {{ CHANNEL_LABELS[row.key as Channel] }}
              <span class="font-mono text-fg-muted">{{ formatPercent(row.share) }}</span>
            </button>
          </li>
        </ul>
      </header>

      <div class="px-2 pt-2 pb-3 sm:px-3">
        <ErrorState
          v-if="
            (series.error.value && !series.data.value) ||
            (channels.error.value && !channels.data.value)
          "
          class="h-64 sm:h-72"
          message="La répartition par canal n’a pas pu être chargée."
          @retry="(series.reload(), channels.reload())"
        />
        <NoVisitsState v-else-if="isEmpty" bare />
        <BaseSkeleton
          v-else-if="!series.data.value || !channels.data.value"
          class="mx-3 my-2 h-60 sm:h-68"
        />
        <StackedAreaChart
          v-else
          :class="{ 'opacity-60 transition-opacity': series.loading.value }"
          :categories
          :series="chartSeries"
          title="Visites par canal"
          :format-value="(v: number) => formatMetric('visits', v)"
          :format-axis="(v: number) => formatAxis('visits', v)"
        />
      </div>
    </section>

    <!-- min-w-0 on the cards: grid items never shrink below their content otherwise,
         and the tables would widen the page instead of scrolling inside their card. -->
    <div v-if="!isEmpty" class="grid gap-5 lg:grid-cols-2">
      <section
        v-for="block in [
          {
            id: 'referrers',
            title: 'Sites référents',
            hint: 'Moteurs de recherche, réseaux sociaux et sites qui envoient des visiteurs.',
            column: 'Site',
            dimension: 'referrer' as const,
            query: referrers,
            empty: 'Aucun site référent sur cette période.',
          },
          {
            id: 'campaigns',
            title: 'Campagnes',
            hint: 'Visites arrivées par un lien de campagne (paramètres UTM).',
            column: 'Campagne',
            dimension: 'campaign' as const,
            query: campaigns,
            empty: 'Aucune campagne sur cette période.',
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
        <p
          v-else-if="block.query.data.value.length === 0"
          class="flex h-40 items-center justify-center text-[13px] text-fg-muted"
        >
          {{ block.empty }}
        </p>
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
