import type { DateRange, Granularity } from '../domain/period'
import type {
  BreakdownRow,
  Dimension,
  Kpis,
  MetricKey,
  PageRow,
  TimeseriesPoint,
} from '../domain/metrics'

/** Everything a statistic depends on: which site, which period, compared to what. */
export interface AnalyticsQuery {
  siteId: string
  range: DateRange
  comparisonRange: DateRange
  granularity: Granularity
}

/**
 * The contract between the UI and wherever the statistics come from.
 *
 * Today: MockAnalyticsRepository (generated sessions, computed in the browser).
 * Later: a Supabase implementation calling SQL functions. Components only know this
 * interface, so swapping the source will not touch a single component.
 * Every method is async, as a network call would be.
 */
export interface AnalyticsRepository {
  getKpis(query: AnalyticsQuery): Promise<Kpis>
  getTimeseries(query: AnalyticsQuery, metric: MetricKey): Promise<TimeseriesPoint[]>
  getBreakdown(query: AnalyticsQuery, dimension: Dimension): Promise<BreakdownRow[]>
  getPages(query: AnalyticsQuery): Promise<PageRow[]>
}
