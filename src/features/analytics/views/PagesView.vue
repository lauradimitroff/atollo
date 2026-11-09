<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { FileSearch, FilterX } from '@lucide/vue'

import type { SortOrder, SortState } from '@/shared/composables/useTableState'
import BaseButton from '@/shared/ui/BaseButton.vue'
import BaseSkeleton from '@/shared/ui/BaseSkeleton.vue'
import EmptyState from '@/shared/ui/EmptyState.vue'
import ErrorState from '@/shared/ui/ErrorState.vue'
import PagesTable, { type PageColumn } from '../components/PagesTable.vue'
import { useAnalyticsQuery } from '../composables/useAnalyticsQuery'
import { useFilters } from '../composables/useFilters'
import { analytics } from '../data'

const pages = useAnalyticsQuery((q) => analytics.getPages(q))
const { filters, clear: clearFilters } = useFilters()

/**
 * Sort stored in the URL (?sort=exitRate&order=asc), like the period and filters:
 * a shared link opens the same table. `replace`: sorting is not a navigation step.
 */
const SORTABLE: readonly PageColumn[] = [
  'path',
  'visitors',
  'pageviews',
  'entries',
  'exitRate',
  'avgTimeS',
]
const DEFAULT_SORT: SortState<PageColumn> = { key: 'visitors', order: 'desc' }

const route = useRoute()
const router = useRouter()

const sort = computed<SortState<PageColumn>>({
  get: () => {
    const key = route.query.sort as PageColumn
    if (!SORTABLE.includes(key)) return DEFAULT_SORT
    const order: SortOrder = route.query.order === 'asc' ? 'asc' : 'desc'
    return { key, order }
  },
  set: (next) => {
    const rest = Object.fromEntries(
      Object.entries(route.query).filter(([name]) => name !== 'sort' && name !== 'order'),
    )
    const isDefault = next.key === DEFAULT_SORT.key && next.order === DEFAULT_SORT.order
    void router.replace({
      query: isDefault ? rest : { ...rest, sort: next.key, order: next.order },
    })
  },
})
</script>

<template>
  <section class="rounded-xl border border-line bg-surface shadow-xs" aria-labelledby="pages-title">
    <header class="border-b border-line px-5 py-4">
      <h2 id="pages-title" class="text-[13px] font-medium">Toutes les pages</h2>
      <p class="mt-1 text-xs text-fg-muted">
        Cliquez sur une page pour ne garder que les visites qui y sont passées. Le temps moyen
        exclut la dernière page de chaque visite, dont la durée est inconnue.
      </p>
    </header>

    <ErrorState
      v-if="pages.error.value && !pages.data.value"
      class="h-72"
      message="Les statistiques des pages n’ont pas pu être chargées."
      @retry="pages.reload()"
    />

    <div v-else-if="!pages.data.value" class="flex flex-col gap-3 p-5" aria-label="Chargement">
      <BaseSkeleton v-for="n in 8" :key="n" class="h-7" />
    </div>

    <EmptyState
      v-else-if="pages.data.value.length === 0 && filters.length"
      bare
      :icon="FilterX"
      title="Aucune page vue avec ces filtres"
      description="Retirez un filtre ou élargissez la période pour retrouver des données."
    >
      <BaseButton variant="primary" @click="clearFilters()">Effacer les filtres</BaseButton>
    </EmptyState>

    <EmptyState
      v-else-if="pages.data.value.length === 0"
      bare
      :icon="FileSearch"
      title="Aucune page vue sur cette période"
      description="Les pages apparaîtront ici dès les premières visites."
    />

    <PagesTable
      v-else
      v-model:sort="sort"
      :rows="pages.data.value"
      :loading="pages.loading.value"
    />
  </section>
</template>
