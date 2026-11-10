import { computed, onScopeDispose, ref, shallowRef, watch, type Ref } from 'vue'

import { useCurrentSite } from '@/features/sites/composables/useCurrentSite'
import type { AnalyticsQuery } from '../data'
import { useFilters } from './useFilters'
import { usePeriod } from './usePeriod'

export interface AnalyticsQueryState<T> {
  /** Last successful result. Kept while reloading, so the UI updates without flashing. */
  data: Ref<T | null>
  /** True during the first load and every reload. */
  loading: Ref<boolean>
  error: Ref<Error | null>
  reload: () => Promise<void>
}

/**
 * Loads a statistic for the current site, period and filters, and reloads it
 * whenever one of them changes.
 *
 *   const { data: kpis, loading } = useAnalyticsQuery((q) => analytics.getKpis(q))
 *
 * When the request also depends on local state, declare it with `deps` so a change
 * triggers a reload too:
 *
 *   useAnalyticsQuery((q) => analytics.getTimeseries(q, metric.value), () => metric.value)
 *
 * Race conditions: if the period changes twice quickly, the first answer may
 * arrive after the second. Each request gets a number and only the latest one is
 * allowed to write its result.
 */
export function useAnalyticsQuery<T>(
  load: (query: AnalyticsQuery) => Promise<T>,
  deps: () => unknown = () => null,
): AnalyticsQueryState<T> {
  const { site } = useCurrentSite()
  const { range, comparisonRange, granularity } = usePeriod()
  const { filters } = useFilters()

  const query = computed<AnalyticsQuery>(() => ({
    // Analytics pages only open for a known site (router guard): never empty there.
    siteId: site.value?.id ?? '',
    range: range.value,
    comparisonRange: comparisonRange.value,
    granularity: granularity.value,
    filters: filters.value,
  }))

  // shallowRef: results are replaced as a whole, no need to make every row reactive.
  const data = shallowRef<T | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  let latestRequest = 0
  let disposed = false
  onScopeDispose(() => (disposed = true))

  async function run() {
    const request = ++latestRequest
    loading.value = true
    error.value = null
    try {
      const result = await load(query.value)
      if (request === latestRequest && !disposed) data.value = result
    } catch (cause) {
      if (request === latestRequest && !disposed) {
        error.value = cause instanceof Error ? cause : new Error(String(cause))
      }
    } finally {
      if (request === latestRequest && !disposed) loading.value = false
    }
  }

  // Compare by value: a new but identical range (e.g. after a navigation) is not a change.
  watch(
    () => JSON.stringify([query.value, deps()]),
    () => void run(),
    { immediate: true },
  )

  return { data, loading, error, reload: run }
}
