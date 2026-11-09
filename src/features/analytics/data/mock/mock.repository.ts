import { breakdown, compare, pageStats, summarize, timeseries } from '../../domain/metrics'
import { applyFilters } from '../../domain/filters'
import { elapsedRanges, type DateRange } from '../../domain/period'
import type { AnalyticsQuery, AnalyticsRepository } from '../repository'
import { getSessions } from './sessions'

interface Options {
  /** Simulated network delay [min, max] in ms, so loading states really show. 0 in tests. */
  latency?: readonly [number, number]
  /** Injectable clock, for tests. */
  now?: () => Date
}

export function createMockRepository({
  latency = [150, 400],
  now = () => new Date(),
}: Options = {}): AnalyticsRepository {
  async function delay() {
    const [min, max] = latency
    if (max <= 0) return
    await new Promise((resolve) => setTimeout(resolve, min + Math.random() * (max - min)))
  }

  /** Sessions of the query's site over a range, with the cross filters applied. */
  function sessions(query: AnalyticsQuery, range: DateRange, clock: Date) {
    return applyFilters(getSessions(query.siteId, range, clock), query.filters)
  }

  return {
    async getKpis(query) {
      await delay()
      const clock = now()
      // Same elapsed time on both sides while the period is running (see elapsedRanges).
      const ranges = elapsedRanges(query.range, query.comparisonRange, clock)
      return compare(
        summarize(sessions(query, ranges.current, clock)),
        summarize(sessions(query, ranges.comparison, clock)),
      )
    },

    async getTimeseries(query, metric) {
      await delay()
      const clock = now()
      return timeseries(
        { range: query.range, sessions: sessions(query, query.range, clock) },
        {
          range: query.comparisonRange,
          sessions: sessions(query, query.comparisonRange, clock),
        },
        query.granularity,
        metric,
        clock,
      )
    },

    async getBreakdown(query, dimension) {
      await delay()
      return breakdown(sessions(query, query.range, now()), dimension)
    },

    async getPages(query) {
      await delay()
      return pageStats(sessions(query, query.range, now()))
    },

    async getSiteSummaries(query, siteIds) {
      await delay()
      const clock = now()
      const ranges = elapsedRanges(query.range, query.comparisonRange, clock)
      return siteIds.map((siteId) => {
        const kpis = compare(
          summarize(getSessions(siteId, ranges.current, clock)),
          summarize(getSessions(siteId, ranges.comparison, clock)),
        )
        const points = timeseries(
          { range: query.range, sessions: getSessions(siteId, query.range, clock) },
          { range: query.comparisonRange, sessions: [] },
          query.granularity,
          'visitors',
          clock,
        )
        return {
          siteId,
          visitors: kpis.visitors,
          visits: kpis.visits,
          bounceRate: kpis.bounceRate,
          trend: points.flatMap((p) => (p.current === null ? [] : [p.current])),
        }
      })
    },
  }
}
