<script setup lang="ts">
/**
 * Complete, sortable breakdown (all referrers, all campaigns, all countries…).
 * Reused by every detail page: the overview cards show the top 6, this shows everything.
 * Sort is local to the table: a page may hold several of them.
 */
import { computed, ref } from 'vue'
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight } from '@lucide/vue'

import { formatNumber, formatPercent } from '@/shared/lib/format'
import { nextSort, useTableState, type SortState } from '@/shared/composables/useTableState'
import BaseButton from '@/shared/ui/BaseButton.vue'
import { useFilters } from '../composables/useFilters'
import type { FilterDimension } from '../domain/filters'

export interface BreakdownTableRow {
  key: string
  label: string
  prefix?: string
  mono?: boolean
  visitors: number
  visits: number
  share: number
}

type Column = 'label' | 'visitors' | 'visits' | 'share'

const props = withDefaults(
  defineProps<{
    rows: readonly BreakdownTableRow[]
    /** Header of the first column: "Site référent", "Campagne"… */
    columnLabel: string
    filterDimension: FilterDimension
    loading?: boolean
    pageSize?: number
  }>(),
  { loading: false, pageSize: 8 },
)

const columns = computed(() => [
  { key: 'label' as const, label: props.columnLabel, numeric: false },
  { key: 'visitors' as const, label: 'Visiteurs', numeric: true },
  { key: 'visits' as const, label: 'Visites', numeric: true },
  { key: 'share' as const, label: 'Part', numeric: true },
])

const sort = ref<SortState<Column>>({ key: 'visits', order: 'desc' })

const { page, pageCount, visible } = useTableState(() => props.rows, {
  columns: {
    label: (r) => r.label,
    visitors: (r) => r.visitors,
    visits: (r) => r.visits,
    share: (r) => r.share,
  },
  searchText: (r) => r.label,
  sort,
  pageSize: props.pageSize,
  tieBreaker: (a, b) => a.label.localeCompare(b.label),
})

const maxVisits = computed(() => Math.max(1, ...props.rows.map((r) => r.visits)))

function ariaSort(key: Column) {
  if (sort.value.key !== key) return 'none'
  return sort.value.order === 'asc' ? 'ascending' : 'descending'
}

const filters = useFilters()
const filterFor = (key: string) => ({ dimension: props.filterDimension, value: key })
</script>

<template>
  <div>
    <!-- Scrolls inside its card on narrow screens instead of widening the page. -->
    <div class="overflow-x-auto">
      <table class="w-full min-w-[26rem] text-[13px]" :aria-busy="loading">
        <thead class="border-b border-line">
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              scope="col"
              :aria-sort="ariaSort(column.key)"
              class="px-3 font-normal first:pl-5 last:pr-5"
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
          <tr v-for="row in visible" :key="row.key">
            <th scope="row" class="py-1 pr-3 pl-3 text-left font-normal">
              <button
                type="button"
                class="group/row relative isolate flex h-8 w-full items-center rounded-md px-2 text-left outline-offset-0"
                :aria-pressed="filters.isActive(filterFor(row.key))"
                :title="
                  filters.isActive(filterFor(row.key))
                    ? `Retirer le filtre ${row.label}`
                    : `Filtrer sur ${row.label}`
                "
                @click="filters.toggle(filterFor(row.key))"
              >
                <span
                  class="absolute inset-y-1 left-0 -z-10 rounded-md bg-accent-soft transition-[width,background-color] duration-300 group-hover/row:bg-accent/20 group-aria-pressed/row:bg-accent/30"
                  :style="{ width: `${(row.visits / maxVisits) * 100}%` }"
                  aria-hidden="true"
                />
                <span class="truncate" :class="{ 'font-mono text-xs': row.mono }">
                  <span v-if="row.prefix" class="mr-1.5" aria-hidden="true">{{ row.prefix }}</span>
                  {{ row.label }}
                </span>
              </button>
            </th>
            <td class="px-3 text-right font-mono text-xs">{{ formatNumber(row.visitors) }}</td>
            <td class="px-3 text-right font-mono text-xs">{{ formatNumber(row.visits) }}</td>
            <td class="px-3 pr-5 text-right font-mono text-xs text-fg-muted">
              {{ formatPercent(row.share) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      v-if="pageCount > 1"
      class="flex items-center justify-end gap-2 border-t border-line px-5 py-2 text-xs text-fg-muted"
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
