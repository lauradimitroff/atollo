/**
 * Analysis period: pure functions, no Vue, no router.
 * Easy to test and reusable on the server side later.
 *
 * Conventions:
 * - Ranges are half-open: [start, end). "7 days" = 7 × 24 h ending at the next midnight.
 * - Dates are computed in the browser's local time zone for now.
 *   The site's own time zone will be used once sites carry one (step 5).
 */
import {
  addDays,
  addHours,
  differenceInCalendarDays,
  format,
  isAfter,
  isValid,
  parseISO,
  startOfDay,
  startOfHour,
  subDays,
  subHours,
} from 'date-fns'

export const PERIOD_PRESETS = ['24h', '7d', '30d', '90d'] as const
export type PeriodPreset = (typeof PERIOD_PRESETS)[number]

/** Days are "YYYY-MM-DD" strings: exactly what the URL holds, no time zone ambiguity. */
export type Period = { preset: PeriodPreset } | { preset: 'custom'; from: string; to: string }

export interface DateRange {
  start: Date
  /** Exclusive. */
  end: Date
}

export type Granularity = 'hour' | 'day' | 'week'

export const DEFAULT_PERIOD: Period = { preset: '30d' }

/** Oldest day a custom range may start on (the demo data covers one year). */
export const MAX_HISTORY_DAYS = 365

const DAY_FORMAT = 'yyyy-MM-dd'
const PRESET_DAYS: Record<Exclude<PeriodPreset, '24h'>, number> = { '7d': 7, '30d': 30, '90d': 90 }

export function isPreset(value: unknown): value is PeriodPreset {
  return PERIOD_PRESETS.includes(value as PeriodPreset)
}

export function toDayString(date: Date): string {
  return format(date, DAY_FORMAT)
}

function parseDay(value: unknown): Date | null {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const date = parseISO(value)
  return isValid(date) ? date : null
}

/** Concrete dates covered by a period, relative to `now`. */
export function resolveRange(period: Period, now: Date = new Date()): DateRange {
  if (period.preset === '24h') {
    const end = addHours(startOfHour(now), 1)
    return { start: subHours(end, 24), end }
  }
  if (period.preset === 'custom') {
    // Validated by parsePeriod, hence the non-null assertions.
    const from = parseDay(period.from)!
    const to = parseDay(period.to)!
    return { start: startOfDay(from), end: addDays(startOfDay(to), 1) }
  }
  const end = addDays(startOfDay(now), 1)
  return { start: subDays(end, PRESET_DAYS[period.preset]), end }
}

/**
 * The period just before, with the same length: the comparison baseline.
 * Calendar-day arithmetic (not milliseconds), so a daylight-saving change
 * inside the range does not shift the comparison by one hour.
 */
export function previousRange(range: DateRange, granularity: Granularity): DateRange {
  if (granularity === 'hour') {
    const hours = Math.round((range.end.getTime() - range.start.getTime()) / 3_600_000)
    return { start: subHours(range.start, hours), end: range.start }
  }
  const days = differenceInCalendarDays(range.end, range.start)
  return { start: subDays(range.start, days), end: range.start }
}

/** Chart resolution: enough points to read a trend, not so many it becomes noise. */
export function granularityFor(range: DateRange): Granularity {
  const days = differenceInCalendarDays(range.end, range.start)
  if (days <= 2) return 'hour'
  if (days <= 120) return 'day'
  return 'week'
}

/**
 * Reads a period from URL query params. Anything invalid falls back to the default,
 * so a hand-edited or outdated link never breaks the page.
 */
export function parsePeriod(query: Record<string, unknown>, now: Date = new Date()): Period {
  const { period, from, to } = query

  if (isPreset(period)) return { preset: period }

  if (period === 'custom') {
    const start = parseDay(from)
    const end = parseDay(to)
    const oldest = subDays(startOfDay(now), MAX_HISTORY_DAYS)
    if (
      start &&
      end &&
      !isAfter(start, end) &&
      !isAfter(end, startOfDay(now)) &&
      !isAfter(oldest, start)
    ) {
      return { preset: 'custom', from: toDayString(start), to: toDayString(end) }
    }
  }

  return DEFAULT_PERIOD
}

/** The query params representing a period. The default period keeps the URL clean. */
export function periodToQuery(period: Period): Record<string, string> {
  if (period.preset === 'custom') return { period: 'custom', from: period.from, to: period.to }
  if (period.preset === DEFAULT_PERIOD.preset) return {}
  return { period: period.preset }
}

/**
 * Fair comparison for a period that is still running.
 * At 10:00, "7 days" holds 6 full days + 10 hours of today. Comparing it with 7 full
 * previous days would always show a drop. Both ranges are cut to the same elapsed
 * time: 6 days 10 hours each.
 */
export function elapsedRanges(
  range: DateRange,
  comparison: DateRange,
  now: Date = new Date(),
): { current: DateRange; comparison: DateRange } {
  if (now >= range.end) return { current: range, comparison }
  const elapsed = Math.max(0, now.getTime() - range.start.getTime())
  return {
    current: { start: range.start, end: new Date(range.start.getTime() + elapsed) },
    comparison: {
      start: comparison.start,
      end: new Date(Math.min(comparison.start.getTime() + elapsed, comparison.end.getTime())),
    },
  }
}
