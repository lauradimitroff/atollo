import { describe, expect, it } from 'vitest'

import {
  applyFilters,
  filtersToQuery,
  parseFilters,
  toggleFilter,
  withoutFilters,
  type Filter,
} from './filters'
import type { Session } from './types'

function session(overrides: Partial<Session>, paths: string[] = ['/']): Session {
  return {
    id: Math.random().toString(36),
    visitorId: 'v',
    startedAt: 0,
    durationS: 0,
    channel: 'direct',
    referrer: null,
    utm: null,
    country: 'FR',
    city: 'Lyon',
    device: 'desktop',
    browser: 'Firefox',
    os: 'Linux',
    pageviews: paths.map((path, i) => ({ path, viewedAt: i, timeOnPageS: null })),
    ...overrides,
  }
}

const google = session({ channel: 'organic', referrer: 'google.com', device: 'mobile' }, [
  '/blog',
  '/tarifs',
])
const direct = session({ channel: 'direct' }, ['/', '/contact'])
const paris = session({ channel: 'organic', referrer: 'google.com', city: 'Paris' }, ['/tarifs'])
const all = [google, direct, paris]

describe('applyFilters', () => {
  it('keeps every session without filter', () => {
    expect(applyFilters(all, [])).toEqual(all)
  })

  it('combines filters with AND', () => {
    const filters: Filter[] = [
      { dimension: 'channel', value: 'organic' },
      { dimension: 'device', value: 'mobile' },
    ]
    expect(applyFilters(all, filters)).toEqual([google])
  })

  it('matches "page" on any page of the visit, entry page only on the first', () => {
    expect(applyFilters(all, [{ dimension: 'page', value: '/tarifs' }])).toEqual([google, paris])
    expect(applyFilters(all, [{ dimension: 'entryPage', value: '/tarifs' }])).toEqual([paris])
    expect(applyFilters(all, [{ dimension: 'exitPage', value: '/contact' }])).toEqual([direct])
  })

  it('identifies a city with its country', () => {
    expect(applyFilters(all, [{ dimension: 'city', value: 'FR:Paris' }])).toEqual([paris])
  })
})

describe('toggleFilter', () => {
  const organic: Filter = { dimension: 'channel', value: 'organic' }

  it('adds, replaces within a dimension, and removes on second click', () => {
    const added = toggleFilter([], organic)
    expect(added).toEqual([organic])

    const replaced = toggleFilter(added, { dimension: 'channel', value: 'social' })
    expect(replaced).toEqual([{ dimension: 'channel', value: 'social' }])

    expect(toggleFilter(added, organic)).toEqual([])
  })

  it('keeps filters of other dimensions', () => {
    const mobile: Filter = { dimension: 'device', value: 'mobile' }
    expect(toggleFilter([mobile], organic)).toEqual([mobile, organic])
  })
})

describe('URL', () => {
  it('reads one param per dimension and ignores the rest', () => {
    expect(parseFilters({ channel: 'organic', city: 'FR:Lyon', period: '7d', device: '' })).toEqual(
      [
        { dimension: 'channel', value: 'organic' },
        { dimension: 'city', value: 'FR:Lyon' },
      ],
    )
  })

  it('round-trips and can be stripped from a query', () => {
    const filters: Filter[] = [{ dimension: 'page', value: '/blog' }]
    expect(parseFilters(filtersToQuery(filters))).toEqual(filters)
    expect(withoutFilters({ page: '/blog', period: '7d' })).toEqual({ period: '7d' })
  })
})
