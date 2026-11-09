import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import {
  granularityFor,
  parsePeriod,
  periodToQuery,
  previousRange,
  resolveRange,
  type Period,
  type PeriodPreset,
} from '../domain/period'

/**
 * The analysis period, stored in the URL (?period=7d or ?period=custom&from=…&to=…).
 *
 * Why the URL and not a Pinia store: the URL already is shared global state.
 * Every component reading it sees the same value, and on top of that the period
 * survives a reload, can be shared as a link and follows the back button.
 * A store would duplicate it and require keeping both in sync.
 */
export function usePeriod() {
  const route = useRoute()
  const router = useRouter()

  const period = computed<Period>(() => parsePeriod(route.query))
  const range = computed(() => resolveRange(period.value))
  const granularity = computed(() => granularityFor(range.value))
  const comparisonRange = computed(() => previousRange(range.value, granularity.value))

  /** Query params to carry over in links, so navigating keeps the period. */
  const query = computed(() => periodToQuery(period.value))

  function setPeriod(next: Period) {
    // Other params are kept; only the period-related ones are replaced.
    const { period: _p, from: _f, to: _t, ...rest } = route.query
    return router.push({ query: { ...rest, ...periodToQuery(next) } })
  }

  function setPreset(preset: PeriodPreset) {
    return setPeriod({ preset })
  }

  return { period, range, comparisonRange, granularity, query, setPeriod, setPreset }
}
