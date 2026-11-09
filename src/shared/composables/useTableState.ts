import { computed, ref, toValue, watch, type MaybeRefOrGetter, type Ref } from 'vue'

export type SortOrder = 'asc' | 'desc'

export interface SortState<K extends string> {
  key: K
  order: SortOrder
}

interface Options<T, K extends string> {
  /** How to read the sortable value of each column. `null` always sorts last. */
  columns: Record<K, (row: T) => string | number | null>
  /** Text the search box looks into. */
  searchText: (row: T) => string
  /** Current sort, owned by the caller (it may live in the URL). */
  sort: Ref<SortState<K>>
  pageSize?: number
  /** Breaks ties so the order is stable whatever the sort (e.g. by name). */
  tieBreaker?: (a: T, b: T) => number
}

const collator = new Intl.Collator('fr', { numeric: true, sensitivity: 'base' })

/**
 * Sorting, searching and paging a list, independently of how it is displayed.
 * Pure logic in a composable: the table component stays simple, and this part is
 * tested on its own.
 */
export function useTableState<T, K extends string>(
  rows: MaybeRefOrGetter<readonly T[]>,
  { columns, searchText, sort, pageSize = 10, tieBreaker }: Options<T, K>,
) {
  const search = ref('')
  const page = ref(1)

  const filtered = computed(() => {
    const term = search.value.trim().toLocaleLowerCase('fr')
    const all = toValue(rows)
    return term ? all.filter((row) => searchText(row).toLocaleLowerCase('fr').includes(term)) : all
  })

  const sorted = computed(() => {
    const read = columns[sort.value.key]
    const direction = sort.value.order === 'asc' ? 1 : -1
    return [...filtered.value].sort((a, b) => {
      const va = read(a)
      const vb = read(b)
      if (va === null || vb === null) {
        if (va !== vb) return va === null ? 1 : -1 // missing values last, whatever the order
      } else {
        const result =
          typeof va === 'number' && typeof vb === 'number'
            ? va - vb
            : collator.compare(String(va), String(vb))
        if (result !== 0) return result * direction
      }
      return tieBreaker?.(a, b) ?? 0
    })
  })

  const pageCount = computed(() => Math.max(1, Math.ceil(sorted.value.length / pageSize)))
  const visible = computed(() =>
    sorted.value.slice((page.value - 1) * pageSize, page.value * pageSize),
  )

  // A new search or sort starts again from the first page.
  watch([search, () => sort.value.key, () => sort.value.order], () => (page.value = 1))
  // Never stay on a page that no longer exists (e.g. after a period change).
  watch(pageCount, (count) => {
    if (page.value > count) page.value = count
  })

  return {
    search,
    page,
    pageCount,
    /** Rows matching the search, all pages. */
    total: computed(() => sorted.value.length),
    visible,
  }
}

/** Next sort when a column header is clicked: same column flips, a new one starts descending. */
export function nextSort<K extends string>(current: SortState<K>, key: K): SortState<K> {
  if (current.key === key) return { key, order: current.order === 'desc' ? 'asc' : 'desc' }
  return { key, order: 'desc' }
}
