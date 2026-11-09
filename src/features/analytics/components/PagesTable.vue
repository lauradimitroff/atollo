<script setup lang="ts">
import { computed } from 'vue'
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Search, X } from '@lucide/vue'

import { formatDuration, formatNumber, formatPercent } from '@/shared/lib/format'
import { nextSort, useTableState, type SortState } from '@/shared/composables/useTableState'
import BaseButton from '@/shared/ui/BaseButton.vue'
import { useFilters } from '../composables/useFilters'
import type { PageRow } from '../domain/metrics'

export type PageColumn = 'path' | 'visitors' | 'pageviews' | 'entries' | 'exitRate' | 'avgTimeS'

const props = defineProps<{ rows: readonly PageRow[]; loading: boolean }>()
/** Sort state, owned by the parent (stored in the URL). */
const sort = defineModel<SortState<PageColumn>>('sort', { required: true })

const COLUMNS: { key: PageColumn; label: string; numeric: boolean }[] = [
  { key: 'path', label: 'Page', numeric: false },
  { key: 'visitors', label: 'Visiteurs', numeric: true },
  { key: 'pageviews', label: 'Pages vues', numeric: true },
  { key: 'entries', label: 'Entrées', numeric: true },
  { key: 'exitRate', label: 'Taux de sortie', numeric: true },
  { key: 'avgTimeS', label: 'Temps moyen', numeric: true },
]

const { search, page, pageCount, total, visible } = useTableState(() => props.rows, {
  columns: {
    path: (r) => r.path,
    visitors: (r) => r.visitors,
    pageviews: (r) => r.pageviews,
    entries: (r) => r.entries,
    exitRate: (r) => r.exitRate,
    avgTimeS: (r) => r.avgTimeS,
  },
  searchText: (r) => r.path,
  sort,
  tieBreaker: (a, b) => a.path.localeCompare(b.path),
})

const maxVisitors = computed(() => Math.max(1, ...props.rows.map((r) => r.visitors)))

function ariaSort(key: PageColumn) {
  if (sort.value.key !== key) return 'none'
  return sort.value.order === 'asc' ? 'ascending' : 'descending'
}

// Clicking a page filters the whole dashboard on visits that saw it.
const filters = useFilters()
const pageFilter = (path: string) => ({ dimension: 'page' as const, value: path })
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
      <p class="text-xs text-fg-muted" aria-live="polite">
        <span class="font-mono text-fg">{{ formatNumber(total) }}</span>
        {{ total > 1 ? 'pages' : 'page' }}
      </p>
      <label class="relative w-full sm:w-64">
        <span class="sr-only">Rechercher une page</span>
        <Search
          class="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-fg-subtle"
          aria-hidden="true"
        />
        <input
          v-model="search"
          type="search"
          placeholder="Rechercher une page…"
          class="h-8 w-full rounded-lg border border-line bg-surface pr-8 pl-8 text-[13px] shadow-xs placeholder:text-fg-subtle hover:border-line-strong focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-accent-soft focus-visible:outline-none [&::-webkit-search-cancel-button]:hidden"
        />
        <button
          v-if="search"
          type="button"
          class="absolute top-1/2 right-1.5 grid size-5 -translate-y-1/2 place-items-center rounded text-fg-subtle hover:text-fg"
          aria-label="Effacer la recherche"
          @click="search = ''"
        >
          <X class="size-3.5" aria-hidden="true" />
        </button>
      </label>
    </div>

    <!-- Horizontal scroll on small screens, the page column stays visible. -->
    <div class="overflow-x-auto">
      <table class="w-full min-w-[720px] text-[13px]" :aria-busy="loading">
        <caption class="sr-only">
          Statistiques par page, triées par
          {{
            COLUMNS.find((c) => c.key === sort.key)?.label
          }}
          ({{
            sort.order === 'asc' ? 'croissant' : 'décroissant'
          }})
        </caption>
        <thead class="border-y border-line bg-surface-muted/40">
          <tr>
            <th
              v-for="column in COLUMNS"
              :key="column.key"
              scope="col"
              :aria-sort="ariaSort(column.key)"
              class="px-3 py-0 font-normal first:sticky first:left-0 first:z-10 first:bg-surface first:pl-5 last:pr-5"
              :class="column.numeric ? 'text-right' : 'text-left'"
            >
              <button
                type="button"
                class="inline-flex h-9 items-center gap-1 text-label text-[10px] transition-colors hover:text-fg"
                :class="{ 'flex-row-reverse': column.numeric, 'text-fg': sort.key === column.key }"
                @click="sort = nextSort(sort, column.key)"
              >
                {{ column.label }}
                <ArrowUp
                  v-if="sort.key === column.key && sort.order === 'asc'"
                  class="size-3"
                  aria-hidden="true"
                />
                <ArrowDown v-else-if="sort.key === column.key" class="size-3" aria-hidden="true" />
              </button>
            </th>
          </tr>
        </thead>

        <tbody class="divide-y divide-line transition-opacity" :class="{ 'opacity-60': loading }">
          <tr v-for="row in visible" :key="row.path">
            <th
              scope="row"
              class="sticky left-0 z-10 bg-surface py-1.5 pr-3 pl-3 text-left font-normal"
            >
              <button
                type="button"
                class="group/page relative isolate flex h-8 w-full max-w-[22rem] items-center rounded-md px-2 text-left outline-offset-0"
                :aria-pressed="filters.isActive(pageFilter(row.path))"
                :title="
                  filters.isActive(pageFilter(row.path))
                    ? `Retirer le filtre ${row.path}`
                    : `Filtrer sur les visites passées par ${row.path}`
                "
                @click="filters.toggle(pageFilter(row.path))"
              >
                <span
                  class="absolute inset-y-1 left-0 -z-10 rounded-md bg-accent-soft transition-[width,background-color] duration-300 group-hover/page:bg-accent/20 group-aria-pressed/page:bg-accent/30"
                  :style="{ width: `${(row.visitors / maxVisitors) * 100}%` }"
                  aria-hidden="true"
                />
                <span class="truncate font-mono text-xs">{{ row.path }}</span>
              </button>
            </th>
            <td class="px-3 text-right font-mono text-xs">{{ formatNumber(row.visitors) }}</td>
            <td class="px-3 text-right font-mono text-xs">{{ formatNumber(row.pageviews) }}</td>
            <td class="px-3 text-right font-mono text-xs">{{ formatNumber(row.entries) }}</td>
            <td class="px-3 text-right font-mono text-xs">{{ formatPercent(row.exitRate) }}</td>
            <td class="px-3 pr-5 text-right font-mono text-xs">
              <span
                v-if="row.avgTimeS === null"
                class="text-fg-subtle"
                title="Inconnu : cette page n’est consultée qu’en fin de visite"
              >
                —
              </span>
              <template v-else>{{ formatDuration(row.avgTimeS) }}</template>
            </td>
          </tr>

          <tr v-if="total === 0">
            <td :colspan="COLUMNS.length" class="px-5 py-10 text-center text-fg-muted">
              Aucune page ne contient « {{ search }} ».
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      v-if="pageCount > 1"
      class="flex items-center justify-end gap-2 border-t border-line px-5 py-2.5 text-xs text-fg-muted"
    >
      <span aria-live="polite">Page {{ page }} sur {{ pageCount }}</span>
      <BaseButton
        icon-only
        size="sm"
        variant="ghost"
        :disabled="page === 1"
        aria-label="Page précédente"
        @click="page--"
      >
        <ChevronLeft aria-hidden="true" />
      </BaseButton>
      <BaseButton
        icon-only
        size="sm"
        variant="ghost"
        :disabled="page === pageCount"
        aria-label="Page suivante"
        @click="page++"
      >
        <ChevronRight aria-hidden="true" />
      </BaseButton>
    </div>
  </div>
</template>
