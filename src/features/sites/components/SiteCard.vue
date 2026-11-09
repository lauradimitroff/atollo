<script setup lang="ts">
import { computed } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import { ArrowUpRight } from '@lucide/vue'

import MetricChange from '@/features/analytics/components/MetricChange.vue'
import type { SiteSummary } from '@/features/analytics/data'
import TrendSparkline from '@/shared/charts/TrendSparkline.vue'
import { formatNumber, formatPercent } from '@/shared/lib/format'
import BaseSkeleton from '@/shared/ui/BaseSkeleton.vue'
import type { Site } from '../types'
import SiteFavicon from './SiteFavicon.vue'

/** One site of the multi-site overview. The whole card is a link to its dashboard. */
const props = defineProps<{
  site: Site
  /** null while loading. */
  summary: SiteSummary | null
  to: RouteLocationRaw
}>()

/** No visit ever recorded on either period: most likely the script is not installed. */
const awaitingData = computed(
  () => props.summary?.visitors.current === 0 && props.summary.visitors.previous === 0,
)
</script>

<template>
  <RouterLink
    :to
    class="group flex h-full flex-col gap-4 rounded-xl border border-line bg-surface p-5 shadow-xs transition-colors hover:border-line-strong"
  >
    <div class="flex items-center gap-3">
      <SiteFavicon :name="site.name" />
      <span class="min-w-0 flex-1 leading-tight">
        <span class="block truncate font-medium">{{ site.name }}</span>
        <span class="block truncate text-xs text-fg-muted">{{ site.domain }}</span>
      </span>
      <ArrowUpRight
        class="size-4 shrink-0 text-fg-subtle transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent"
        aria-hidden="true"
      />
    </div>

    <template v-if="!summary">
      <div>
        <BaseSkeleton class="h-3 w-24" />
        <BaseSkeleton class="mt-2.5 h-7 w-28" />
      </div>
      <BaseSkeleton class="h-10 w-full" />
      <BaseSkeleton class="h-3 w-40" />
    </template>

    <template v-else-if="awaitingData">
      <div>
        <p class="text-label text-[10px]">Visiteurs uniques</p>
        <p class="mt-2 text-[13px] font-medium">En attente des premières visites</p>
        <p class="mt-1 text-xs text-fg-muted">Le script de suivi n’est pas encore détecté.</p>
      </div>
      <TrendSparkline :values="[]" />
    </template>

    <template v-else>
      <div>
        <p class="text-label text-[10px]">Visiteurs uniques</p>
        <p class="mt-2 flex items-baseline gap-3">
          <span class="font-mono text-2xl leading-none font-medium tracking-tight">
            {{ formatNumber(summary.visitors.current) }}
          </span>
          <MetricChange metric="visitors" :change="summary.visitors.change" />
        </p>
      </div>
      <TrendSparkline :values="summary.trend" />
      <p class="flex gap-4 text-xs text-fg-muted">
        <span>
          Visites <span class="font-mono text-fg">{{ formatNumber(summary.visits.current) }}</span>
        </span>
        <span>
          Rebond
          <span class="font-mono text-fg">{{ formatPercent(summary.bounceRate.current) }}</span>
        </span>
      </p>
    </template>
  </RouterLink>
</template>
