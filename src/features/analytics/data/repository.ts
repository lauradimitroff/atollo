import type { Filter } from '../domain/filters'
import type { DateRange, Granularity } from '../domain/period'
import type {
  BreakdownRow,
  Dimension,
  Kpis,
  MetricComparison,
  MetricKey,
  PageRow,
  TimeseriesPoint,
} from '../domain/metrics'

/** Everything a statistic depends on: which site, which period, compared to what, filtered how. */
export interface AnalyticsQuery {
  siteId: string
  range: DateRange
  comparisonRange: DateRange
  granularity: Granularity
  /** Cross filters (AND), applied to both the period and its comparison. */
  filters: Filter[]
}

/** A site-independent query: the multi-site overview compares every site on the same period. */
export type PortfolioQuery = Pick<AnalyticsQuery, 'range' | 'comparisonRange' | 'granularity'>

/** One card of the multi-site overview. */
export interface SiteSummary {
  siteId: string
  visitors: MetricComparison
  visits: MetricComparison
  bounceRate: MetricComparison
  /** Unique visitors per chart point over the period (past points only): the sparkline. */
  trend: number[]
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
  /** Key figures of several sites at once, for the multi-site overview. */
  getSiteSummaries(query: PortfolioQuery, siteIds: readonly string[]): Promise<SiteSummary[]>
}
