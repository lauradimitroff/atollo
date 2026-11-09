import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import {
  filtersToQuery,
  parseFilters,
  toggleFilter,
  withoutFilters,
  type Filter,
  type FilterDimension,
} from '../domain/filters'

/**
 * Cross filters, stored in the URL like the period (?channel=organic&device=mobile).
 * `push` (not `replace`): the back button undoes the last filter, which is what
 * people expect when exploring data.
 */
export function useFilters() {
  const route = useRoute()
  const router = useRouter()

  const filters = computed(() => parseFilters(route.query))
  const query = computed(() => filtersToQuery(filters.value))

  function setFilters(next: readonly Filter[]) {
    return router.push({ query: { ...withoutFilters(route.query), ...filtersToQuery(next) } })
  }

  function isActive(filter: Filter) {
    return filters.value.some((f) => f.dimension === filter.dimension && f.value === filter.value)
  }

  return {
    filters,
    query,
    isActive,
    toggle: (filter: Filter) => setFilters(toggleFilter(filters.value, filter)),
    remove: (dimension: FilterDimension) =>
      setFilters(filters.value.filter((f) => f.dimension !== dimension)),
    clear: () => setFilters([]),
  }
}
