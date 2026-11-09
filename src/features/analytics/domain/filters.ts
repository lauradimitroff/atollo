/**
 * Cross filters: "only visits from Google", "only mobile", "only visits that saw /tarifs".
 * Pure functions, like period.ts: parsing from the URL, serializing back, matching sessions.
 */
import type { Dimension } from './metrics'
import type { Session } from './types'

/** Every breakdown dimension, plus "page": sessions that viewed a page at any point. */
export type FilterDimension = Dimension | 'page'

export interface Filter {
  dimension: FilterDimension
  value: string
}

/** Order also used to display the filter chips. */
export const FILTER_DIMENSIONS: readonly FilterDimension[] = [
  'channel',
  'referrer',
  'campaign',
  'page',
  'entryPage',
  'exitPage',
  'country',
  'city',
  'device',
  'browser',
  'os',
]

function isFilterDimension(value: string): value is FilterDimension {
  return (FILTER_DIMENSIONS as readonly string[]).includes(value)
}

/**
 * One URL param per dimension: ?channel=organic&device=mobile&city=FR:Lyon.
 * Readable, and naturally "one value per dimension". Unknown params are ignored.
 */
export function parseFilters(query: Record<string, unknown>): Filter[] {
  return FILTER_DIMENSIONS.flatMap((dimension) => {
    const value = query[dimension]
    return typeof value === 'string' && value !== '' ? [{ dimension, value }] : []
  })
}

export function filtersToQuery(filters: readonly Filter[]): Record<string, string> {
  return Object.fromEntries(filters.map((f) => [f.dimension, f.value]))
}

/** The query without any filter param (to keep the period or metric only). */
export function withoutFilters<T extends Record<string, unknown>>(query: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(query).filter(([key]) => !isFilterDimension(key)),
  ) as Partial<T>
}

/**
 * Clicking a value filters on it; clicking the active value again removes it.
 * Another value of the same dimension replaces the previous one.
 */
export function toggleFilter(filters: readonly Filter[], filter: Filter): Filter[] {
  const current = filters.find((f) => f.dimension === filter.dimension)
  const others = filters.filter((f) => f.dimension !== filter.dimension)
  return current?.value === filter.value ? others : [...others, filter]
}

const SESSION_VALUE: Record<Dimension, (s: Session) => string | null> = {
  channel: (s) => s.channel,
  referrer: (s) => s.referrer,
  campaign: (s) => s.utm?.campaign ?? null,
  country: (s) => s.country,
  city: (s) => `${s.country}:${s.city}`,
  device: (s) => s.device,
  browser: (s) => s.browser,
  os: (s) => s.os,
  entryPage: (s) => s.pageviews[0]!.path,
  exitPage: (s) => s.pageviews[s.pageviews.length - 1]!.path,
}

/** The value of a session for a dimension (null when it has none, e.g. no referrer). */
export function sessionValue(session: Session, dimension: Dimension): string | null {
  return SESSION_VALUE[dimension](session)
}

function matches(session: Session, filter: Filter): boolean {
  if (filter.dimension === 'page') return session.pageviews.some((p) => p.path === filter.value)
  return SESSION_VALUE[filter.dimension](session) === filter.value
}

/** Sessions matching every filter (AND). */
export function applyFilters(sessions: readonly Session[], filters: readonly Filter[]): Session[] {
  if (filters.length === 0) return sessions as Session[]
  return sessions.filter((session) => filters.every((filter) => matches(session, filter)))
}
