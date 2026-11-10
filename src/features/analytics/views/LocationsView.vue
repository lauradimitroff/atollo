<script setup lang="ts">
/**
 * Where visitors are: a world map shaded by visits, then every country and every city.
 * A country on the map, or any row of the tables, is a cross filter.
 */
import { computed, ref } from 'vue'

import { lazyChart } from '@/shared/charts/lazyChart'
import type { MapView } from '@/shared/charts/WorldMap.vue'
import { formatNumber } from '@/shared/lib/format'
import BaseSegmentedControl from '@/shared/ui/BaseSegmentedControl.vue'
import BaseSkeleton from '@/shared/ui/BaseSkeleton.vue'
import ErrorState from '@/shared/ui/ErrorState.vue'
import BreakdownTable, { type BreakdownTableRow } from '../components/BreakdownTable.vue'
import NoVisitsState from '../components/NoVisitsState.vue'
import { useAnalyticsQuery } from '../composables/useAnalyticsQuery'
import { useFilters } from '../composables/useFilters'
import { analytics } from '../data'
import { countryFlag, countryName } from '../domain/labels'

const WorldMap = lazyChart(() => import('@/shared/charts/WorldMap.vue'))

const filters = useFilters()

const countries = useAnalyticsQuery((q) => analytics.getBreakdown(q, 'country'))
const cities = useAnalyticsQuery((q) => analytics.getBreakdown(q, 'city'))

const isEmpty = computed(() => countries.data.value?.length === 0)

// Our demo sites are mostly visited from Europe: frame it first, the world is one click away.
const view = ref<MapView>('europe')
const VIEWS = [
  { value: 'europe', label: 'Europe' },
  { value: 'world', label: 'Monde' },
] as const

const mapValues = computed(() =>
  (countries.data.value ?? []).map((row) => ({ code: row.key, value: row.visits })),
)

const selectedCountries = computed(() =>
  filters.filters.value.filter((f) => f.dimension === 'country').map((f) => f.value),
)

const toggleCountry = (code: string) => filters.toggle({ dimension: 'country', value: code })

const countryRows = computed<BreakdownTableRow[]>(() =>
  (countries.data.value ?? []).map((row) => ({
    ...row,
    label: countryName(row.key),
    prefix: countryFlag(row.key),
  })),
)

// City keys are "FR:Lyon": the country gives the flag, the rest is the name.
const cityRows = computed<BreakdownTableRow[]>(() =>
  (cities.data.value ?? []).map((row) => {
    const [country = '', city = row.key] = row.key.split(':')
    return { ...row, label: city, prefix: countryFlag(country) }
  }),
)

const summary = computed(() => {
  const count = countries.data.value?.length ?? 0
  return count === 1 ? 'Visites depuis 1 pays' : `Visites depuis ${formatNumber(count)} pays`
})
</script>

<template>
  <div class="flex flex-col gap-5">
    <section class="rounded-xl border border-line bg-surface shadow-xs" aria-labelledby="map-title">
      <header class="flex flex-wrap items-start justify-between gap-x-6 gap-y-3 px-5 pt-4">
        <div>
          <h2 id="map-title" class="text-[13px] font-medium">
            {{ countries.data.value?.length ? summary : 'Visites par pays' }}
          </h2>
          <p class="mt-1 text-xs text-fg-muted">
            Cliquez sur un pays pour filtrer toute l’analyse.
          </p>
        </div>
        <BaseSegmentedControl v-model="view" :options="VIEWS" label="Zone affichée" />
      </header>

      <div class="px-2 pt-2 pb-4 sm:px-3">
        <ErrorState
          v-if="countries.error.value && !countries.data.value"
          class="h-72 sm:h-96"
          message="La répartition par pays n’a pas pu être chargée."
          @retry="countries.reload()"
        />
        <NoVisitsState v-else-if="isEmpty" bare />
        <BaseSkeleton v-else-if="!countries.data.value" class="mx-3 my-2 h-68 sm:h-92" />
        <WorldMap
          v-else
          :class="{ 'opacity-60 transition-opacity': countries.loading.value }"
          :values="mapValues"
          :selected="selectedCountries"
          :view
          title="Visites par pays"
          :country-name="countryName"
          :format-value="formatNumber"
          @select="toggleCountry"
        />
      </div>
    </section>

    <!-- min-w-0: grid items never shrink below their content otherwise (see TrafficView). -->
    <div v-if="!isEmpty" class="grid gap-5 lg:grid-cols-2">
      <section
        v-for="block in [
          {
            id: 'countries',
            title: 'Pays',
            hint: 'Pays d’origine des visites, d’après l’adresse IP (jamais conservée).',
            column: 'Pays',
            dimension: 'country' as const,
            query: countries,
            rows: countryRows,
          },
          {
            id: 'cities',
            title: 'Villes',
            hint: 'Ville la plus probable : une estimation, précise à quelques dizaines de kilomètres.',
            column: 'Ville',
            dimension: 'city' as const,
            query: cities,
            rows: cityRows,
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
          :rows="block.rows"
          :column-label="block.column"
          :filter-dimension="block.dimension"
          :loading="block.query.loading.value"
        />
      </section>
    </div>
  </div>
</template>
