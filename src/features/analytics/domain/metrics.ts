/**
 * Statistics computed from raw sessions. Pure functions: the same code will run on
 * mock data today and could run on real data (or be ported to SQL) tomorrow.
 *
 * Definitions follow the project plan:
 * - visitors      distinct visitorId
 * - visits        number of sessions
 * - pageviews     number of pageviews
 * - bounceRate    sessions with a single pageview ÷ sessions (0 → 1)
 * - avgDuration   mean session duration in seconds, bounces counting as 0 s
 */
import { addDays, addHours, addMonths, addWeeks } from 'date-fns'

import { sessionValue } from './filters'
import type { DateRange, Granularity } from './period'
import type { Channel, Session } from './types'

export type MetricKey = 'visitors' | 'visits' | 'pageviews' | 'bounceRate' | 'avgDuration'

export type Summary = Record<MetricKey, number>

export interface MetricDefinition {
  label: string
  format: 'number' | 'percent' | 'duration'
  /** A lower bounce rate is good news: drives the green / red of the change. */
  higherIsBetter: boolean
  /** Rates change in percentage points (41 % → 44 % = +3 pts), the rest in percent. */
  changeUnit: 'percent' | 'points'
}

export const METRICS: Record<MetricKey, MetricDefinition> = {
  visitors: {
    label: 'Visiteurs uniques',
    format: 'number',
    higherIsBetter: true,
    changeUnit: 'percent',
  },
  visits: { label: 'Visites', format: 'number', higherIsBetter: true, changeUnit: 'percent' },
  pageviews: { label: 'Pages vues', format: 'number', higherIsBetter: true, changeUnit: 'percent' },
  bounceRate: {
    label: 'Taux de rebond',
    format: 'percent',
    higherIsBetter: false,
    changeUnit: 'points',
  },
  avgDuration: {
    label: 'Durée moyenne',
    format: 'duration',
    higherIsBetter: true,
    changeUnit: 'percent',
  },
}

export const METRIC_KEYS = Object.keys(METRICS) as MetricKey[]

// ---------------------------------------------------------------------------
// Summary & comparison
// ---------------------------------------------------------------------------

export function summarize(sessions: readonly Session[]): Summary {
  const visitors = new Set<string>()
  let pageviews = 0
  let bounces = 0
  let totalDuration = 0

  for (const session of sessions) {
    visitors.add(session.visitorId)
    pageviews += session.pageviews.length
    if (session.pageviews.length === 1) bounces++
    totalDuration += session.durationS
  }

  const visits = sessions.length
  return {
    visitors: visitors.size,
    visits,
    pageviews,
    bounceRate: visits ? bounces / visits : 0,
    avgDuration: visits ? totalDuration / visits : 0,
  }
}

export interface MetricComparison {
  current: number
  previous: number
  /**
   * +0.124 = +12.4 % (percent unit) or +2.6 points (points unit, already ×100).
   * null when there is nothing to compare with (previous value of 0).
   */
  change: number | null
}

export type Kpis = Record<MetricKey, MetricComparison>

export function compare(current: Summary, previous: Summary): Kpis {
  const kpis = {} as Kpis
  for (const key of METRIC_KEYS) {
    const c = current[key]
    const p = previous[key]
    let change: number | null
    if (METRICS[key].changeUnit === 'points') change = previous.visits ? (c - p) * 100 : null
    else change = p ? (c - p) / p : null
    kpis[key] = { current: c, previous: p, change }
  }
  return kpis
}

/**
 * Is this change good news? Neutral (null) when there is nothing to judge, or when the
 * change is too small to show once rounded (+0.04 % displays as "0 %").
 */
export function changeSentiment(key: MetricKey, change: number | null): 'good' | 'bad' | null {
  if (change === null) return null
  const threshold = METRICS[key].changeUnit === 'points' ? 0.05 : 0.0005
  if (Math.abs(change) < threshold) return null
  return change > 0 === METRICS[key].higherIsBetter ? 'good' : 'bad'
}

// ---------------------------------------------------------------------------
// Time series
// ---------------------------------------------------------------------------

const STEP = { hour: addHours, day: addDays, week: addWeeks, month: addMonths } as const

/** Start of each chart point over the range: hourly, daily, weekly or monthly. */
export function bucketStarts(range: DateRange, granularity: Granularity): Date[] {
  const starts: Date[] = []
  for (let t = range.start; t < range.end; t = STEP[granularity](t, 1)) starts.push(t)
  return starts
}

/** Groups sessions by bucket: binary search on the bucket starts, O(n log b). */
function groupByBucket(sessions: readonly Session[], starts: readonly Date[], end: Date) {
  const times = starts.map((d) => d.getTime())
  const groups: Session[][] = times.map(() => [])
  for (const session of sessions) {
    if (session.startedAt < times[0]! || session.startedAt >= end.getTime()) continue
    let low = 0
    let high = times.length - 1
    while (low < high) {
      const mid = (low + high + 1) >> 1
      if (times[mid]! <= session.startedAt) low = mid
      else high = mid - 1
    }
    groups[low]!.push(session)
  }
  return groups
}

export interface TimeseriesPoint {
  /** Bucket start, epoch milliseconds. */
  start: number
  /** null for a bucket entirely in the future (the rest of today). */
  current: number | null
  /** Same position in the comparison period. */
  previous: number
}

/**
 * One point per bucket for the current period, aligned index by index with the
 * comparison period (day 1 vs day 1, day 2 vs day 2…), which has the same length.
 */
export function timeseries(
  current: { sessions: readonly Session[]; range: DateRange },
  previous: { sessions: readonly Session[]; range: DateRange },
  granularity: Granularity,
  metric: MetricKey,
  now: Date = new Date(),
): TimeseriesPoint[] {
  const starts = bucketStarts(current.range, granularity)
  const previousStarts = bucketStarts(previous.range, granularity)
  const currentGroups = groupByBucket(current.sessions, starts, current.range.end)
  const previousGroups = groupByBucket(previous.sessions, previousStarts, previous.range.end)

  return starts.map((start, i) => ({
    start: start.getTime(),
    current: start > now ? null : summarize(currentGroups[i]!)[metric],
    previous: summarize(previousGroups[i] ?? [])[metric],
  }))
}

export const CHANNELS: readonly Channel[] = [
  'organic',
  'direct',
  'social',
  'referral',
  'campaign',
  'email',
]

export interface ChannelPoint {
  /** Bucket start, epoch milliseconds. */
  start: number
  /** Visits per channel; null for a bucket entirely in the future. */
  visits: Record<Channel, number> | null
}

/** Visits per channel and per chart point: what feeds the stacked traffic chart. */
export function channelTimeseries(
  sessions: readonly Session[],
  range: DateRange,
  granularity: Granularity,
  now: Date = new Date(),
): ChannelPoint[] {
  const starts = bucketStarts(range, granularity)
  const groups = groupByBucket(sessions, starts, range.end)

  return starts.map((start, i) => {
    if (start > now) return { start: start.getTime(), visits: null }
    const visits = Object.fromEntries(CHANNELS.map((c) => [c, 0])) as Record<Channel, number>
    for (const session of groups[i]!) visits[session.channel]++
    return { start: start.getTime(), visits }
  })
}

// ---------------------------------------------------------------------------
// Breakdowns
// ---------------------------------------------------------------------------

export type Dimension =
  | 'channel'
  | 'referrer'
  | 'campaign'
  | 'country'
  | 'city'
  | 'device'
  | 'browser'
  | 'os'
  | 'entryPage'
  | 'exitPage'

export interface BreakdownRow {
  key: string
  visitors: number
  visits: number
  /** Share of the visits that have a value for this dimension (rows sum to 1). */
  share: number
}

/**
 * Visitors and visits per value of a dimension, most visited first.
 * Sessions without a value (no referrer for direct traffic…) are left out.
 * The share is based on visits, so rows add up to exactly 100 %; a visitor who came
 * from two channels is, rightly, a visitor of both.
 */
export function breakdown(sessions: readonly Session[], dimension: Dimension): BreakdownRow[] {
  const groups = new Map<string, { visitors: Set<string>; visits: number }>()
  let total = 0

  for (const session of sessions) {
    const key = sessionValue(session, dimension)
    if (key === null) continue
    total++
    let group = groups.get(key)
    if (!group) groups.set(key, (group = { visitors: new Set(), visits: 0 }))
    group.visitors.add(session.visitorId)
    group.visits++
  }

  return [...groups]
    .map(([key, g]) => ({
      key,
      visitors: g.visitors.size,
      visits: g.visits,
      share: g.visits / total,
    }))
    .sort((a, b) => b.visits - a.visits || a.key.localeCompare(b.key))
}

// ---------------------------------------------------------------------------
// Pages
// ---------------------------------------------------------------------------

export interface PageRow {
  path: string
  visitors: number
  pageviews: number
  /** Sessions that started on this page. */
  entries: number
  /** Sessions that ended on this page. */
  exits: number
  /** Mean time on page, exits excluded (unknown); null if only exits. */
  avgTimeS: number | null
  /** exits ÷ pageviews. */
  exitRate: number
}

export function pageStats(sessions: readonly Session[]): PageRow[] {
  const pages = new Map<
    string,
    {
      visitors: Set<string>
      pageviews: number
      entries: number
      exits: number
      time: number
      timed: number
    }
  >()

  for (const session of sessions) {
    const last = session.pageviews.length - 1
    session.pageviews.forEach((view, i) => {
      let page = pages.get(view.path)
      if (!page) {
        page = { visitors: new Set(), pageviews: 0, entries: 0, exits: 0, time: 0, timed: 0 }
        pages.set(view.path, page)
      }
      page.visitors.add(session.visitorId)
      page.pageviews++
      if (i === 0) page.entries++
      if (i === last) page.exits++
      if (view.timeOnPageS !== null) {
        page.time += view.timeOnPageS
        page.timed++
      }
    })
  }

  return [...pages]
    .map(([path, p]) => ({
      path,
      visitors: p.visitors.size,
      pageviews: p.pageviews,
      entries: p.entries,
      exits: p.exits,
      avgTimeS: p.timed ? p.time / p.timed : null,
      exitRate: p.exits / p.pageviews,
    }))
    .sort((a, b) => b.visitors - a.visitors || a.path.localeCompare(b.path))
}
