<script setup lang="ts">
/**
 * Multi-site overview, the home page: every site of the workspace on the same period,
 * most visited first. The core of Atollo for freelancers and agencies.
 */
import { computed } from 'vue'
import { Globe } from '@lucide/vue'

import MetricChange from '@/features/analytics/components/MetricChange.vue'
import { useAnalyticsQuery } from '@/features/analytics/composables/useAnalyticsQuery'
import { usePeriod } from '@/features/analytics/composables/usePeriod'
import { analytics, type SiteSummary } from '@/features/analytics/data'
import { compare } from '@/features/analytics/domain/metrics'
import { formatNumber } from '@/shared/lib/format'
import BaseSkeleton from '@/shared/ui/BaseSkeleton.vue'
import EmptyState from '@/shared/ui/EmptyState.vue'
import ErrorState from '@/shared/ui/ErrorState.vue'
import SiteCard from '../components/SiteCard.vue'
import { useSitesStore } from '../sites.store'

const store = useSitesStore()
const { query: periodQuery } = usePeriod()

const summaries = useAnalyticsQuery(
  (q) =>
    analytics.getSiteSummaries(
      q,
      store.sites.map((site) => site.id),
    ),
  () => store.sites,
)

const byId = computed(
  () => new Map<string, SiteSummary>(summaries.data.value?.map((s) => [s.siteId, s]) ?? []),
)

// Most visited first; while loading, keep the workspace order.
const sortedSites = computed(() =>
  [...store.sites].sort(
    (a, b) =>
      (byId.value.get(b.id)?.visitors.current ?? 0) - (byId.value.get(a.id)?.visitors.current ?? 0),
  ),
)

/** Visitors of all sites added up (each site counts its own visitors). */
const total = computed(() => {
  const list = summaries.data.value
  if (!list) return null
  const sum = (pick: (s: SiteSummary) => number) => list.reduce((acc, s) => acc + pick(s), 0)
  const zero = { visitors: 0, visits: 0, pageviews: 0, bounceRate: 0, avgDuration: 0 }
  return compare(
    { ...zero, visitors: sum((s) => s.visitors.current) },
    { ...zero, visitors: sum((s) => s.visitors.previous) },
  ).visitors
})
</script>

<template>
  <!-- A new account: the first step is to add a site. -->
  <EmptyState
    v-if="store.sites.length === 0"
    :icon="Globe"
    title="Ajoutez votre premier site"
    description="Donnez son nom et son domaine : Atollo vous fournit le code de suivi à installer."
  >
    <RouterLink
      :to="{ name: 'settings-sites' }"
      class="inline-flex h-8 items-center rounded-lg bg-fg px-3 text-[13px] font-medium text-canvas transition-colors hover:bg-fg/90"
    >
      Ajouter un site
    </RouterLink>
  </EmptyState>

  <div v-else class="flex flex-col gap-5">
    <section
      class="flex flex-wrap items-end justify-between gap-4 rounded-xl border border-line bg-surface px-5 py-4 shadow-xs"
      aria-label="Résumé de l’espace"
    >
      <div>
        <p class="text-label text-[10px]">Sites suivis</p>
        <p class="mt-2 font-mono text-2xl leading-none font-medium">{{ store.sites.length }}</p>
      </div>
      <div class="text-right">
        <p class="text-label text-[10px]">Visiteurs, tous sites confondus</p>
        <p v-if="total" class="mt-2 flex items-baseline justify-end gap-3">
          <MetricChange metric="visitors" :change="total.change" />
          <span class="font-mono text-2xl leading-none font-medium tracking-tight">
            {{ formatNumber(total.current) }}
          </span>
        </p>
        <BaseSkeleton v-else class="mt-2 ml-auto h-6 w-32" />
      </div>
    </section>

    <ErrorState
      v-if="summaries.error.value && !summaries.data.value"
      class="h-64 rounded-xl border border-line bg-surface"
      message="Les statistiques des sites n’ont pas pu être chargées."
      @retry="summaries.reload()"
    />

    <ul
      v-else
      class="grid gap-4 transition-opacity sm:grid-cols-2 xl:grid-cols-3"
      :class="{ 'opacity-60': summaries.loading.value && summaries.data.value }"
      :aria-busy="summaries.loading.value"
    >
      <li v-for="site in sortedSites" :key="site.id">
        <SiteCard
          :site
          :summary="byId.get(site.id) ?? null"
          :to="{ name: 'overview', params: { siteId: site.id }, query: periodQuery }"
        />
      </li>
    </ul>
  </div>
</template>
