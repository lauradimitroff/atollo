import { describe, expect, it } from 'vitest'

import {
  breakdown,
  channelTimeseries,
  bucketStarts,
  changeSentiment,
  compare,
  pageStats,
  segments,
  summarize,
  timeseries,
} from './metrics'
import type { Pageview, Session } from './types'

// Small hand-written dataset: every expected number below can be checked by hand.
let nextId = 0
function session(overrides: Partial<Session> & { paths?: string[]; times?: number[] }): Session {
  const startedAt = overrides.startedAt ?? new Date(2026, 9, 14, 10).getTime()
  const paths = overrides.paths ?? ['/']
  const times = overrides.times ?? paths.slice(0, -1).map(() => 30)
  let t = startedAt
  const pageviews: Pageview[] = paths.map((path, i) => {
    const view = { path, viewedAt: t, timeOnPageS: i < paths.length - 1 ? times[i]! : null }
    t += (view.timeOnPageS ?? 0) * 1000 + 1
    return view
  })
  return {
    id: String(nextId++),
    visitorId: 'v1',
    startedAt,
    durationS: times.reduce((a, b) => a + b, 0),
    channel: 'direct',
    referrer: null,
    utm: null,
    country: 'FR',
    city: 'Lyon',
    device: 'desktop',
    browser: 'Firefox',
    os: 'Linux',
    pageviews,
    ...overrides,
  }
}

const sessions: Session[] = [
  // v1 comes twice: one bounce, one 3-page visit (30 s + 90 s)
  session({ visitorId: 'v1', paths: ['/'] }),
  session({
    visitorId: 'v1',
    paths: ['/', '/blog', '/contact'],
    times: [30, 90],
    channel: 'organic',
    referrer: 'google.com',
  }),
  // v2: 2 pages (60 s), from Instagram, on mobile
  session({
    visitorId: 'v2',
    paths: ['/blog', '/'],
    times: [60],
    channel: 'social',
    referrer: 'instagram.com',
    device: 'mobile',
  }),
  // v3: bounce on /contact
  session({ visitorId: 'v3', paths: ['/contact'] }),
]

describe('summarize', () => {
  it('computes the five key metrics', () => {
    expect(summarize(sessions)).toEqual({
      visitors: 3,
      visits: 4,
      pageviews: 7,
      bounceRate: 0.5, // 2 single-page sessions out of 4
      avgDuration: 45, // (0 + 120 + 60 + 0) / 4
    })
  })

  it('returns zeros, not NaN, without sessions', () => {
    expect(summarize([])).toEqual({
      visitors: 0,
      visits: 0,
      pageviews: 0,
      bounceRate: 0,
      avgDuration: 0,
    })
  })
})

describe('compare', () => {
  const current = { visitors: 110, visits: 150, pageviews: 300, bounceRate: 0.44, avgDuration: 90 }
  const previous = { visitors: 100, visits: 120, pageviews: 300, bounceRate: 0.41, avgDuration: 0 }
  const kpis = compare(current, previous)

  it('expresses counts in percent', () => {
    expect(kpis.visitors.change).toBeCloseTo(0.1)
    expect(kpis.visits.change).toBeCloseTo(0.25)
    expect(kpis.pageviews.change).toBe(0)
  })

  it('expresses the bounce rate in percentage points', () => {
    expect(kpis.bounceRate.change).toBeCloseTo(3)
  })

  it('has no change when the previous value is 0', () => {
    expect(kpis.avgDuration.change).toBeNull()
  })

  it('judges the bounce rate in reverse', () => {
    expect(changeSentiment('visitors', 0.1)).toBe('good')
    expect(changeSentiment('bounceRate', 3)).toBe('bad')
    expect(changeSentiment('bounceRate', -2)).toBe('good')
    expect(changeSentiment('visits', null)).toBeNull()
  })

  it('stays neutral for a change that rounds to zero', () => {
    expect(changeSentiment('bounceRate', -0.04)).toBeNull()
    expect(changeSentiment('visits', 0.0004)).toBeNull()
    expect(changeSentiment('visits', 0.001)).toBe('good')
  })
})

describe('breakdown', () => {
  it('groups by channel with shares adding up to 100 %', () => {
    expect(breakdown(sessions, 'channel')).toEqual([
      { key: 'direct', visitors: 2, visits: 2, share: 0.5 },
      { key: 'organic', visitors: 1, visits: 1, share: 0.25 },
      { key: 'social', visitors: 1, visits: 1, share: 0.25 },
    ])
  })

  it('leaves out sessions without a value', () => {
    const rows = breakdown(sessions, 'referrer')
    expect(rows.map((r) => r.key)).toEqual(['google.com', 'instagram.com'])
    expect(rows.reduce((sum, r) => sum + r.share, 0)).toBe(1)
  })

  it('uses the first and last page for entry and exit', () => {
    expect(breakdown(sessions, 'entryPage').map((r) => [r.key, r.visits])).toEqual([
      ['/', 2],
      ['/blog', 1],
      ['/contact', 1],
    ])
    // Tie on 2 visits each: sorted alphabetically.
    expect(breakdown(sessions, 'exitPage').map((r) => [r.key, r.visits])).toEqual([
      ['/', 2],
      ['/contact', 2],
    ])
  })
})

describe('segments', () => {
  it('summarizes each value with the same grouping and order as breakdown', () => {
    const rows = segments(sessions, 'channel')
    expect(rows.map((r) => [r.key, r.visits, r.share])).toEqual(
      breakdown(sessions, 'channel').map((r) => [r.key, r.visits, r.share]),
    )
    for (const row of rows) {
      const group = sessions.filter((s) => s.channel === row.key)
      expect(row).toMatchObject(summarize(group))
    }
  })
})

describe('pageStats', () => {
  const pages = Object.fromEntries(pageStats(sessions).map((p) => [p.path, p]))

  it('counts visitors, pageviews, entries and exits per page', () => {
    expect(pages['/']).toMatchObject({ visitors: 2, pageviews: 3, entries: 2, exits: 2 })
    expect(pages['/contact']).toMatchObject({ visitors: 2, pageviews: 2, entries: 1, exits: 2 })
  })

  it('averages the time on page without the exits', () => {
    expect(pages['/']!.avgTimeS).toBe(30) // only the 30 s view is known
    expect(pages['/blog']!.avgTimeS).toBe(75) // (90 + 60) / 2
    expect(pages['/contact']!.avgTimeS).toBeNull() // always the last page
  })

  it('computes the exit rate', () => {
    expect(pages['/']!.exitRate).toBeCloseTo(2 / 3)
    expect(pages['/contact']!.exitRate).toBe(1)
  })
})

describe('timeseries', () => {
  const day = (d: number, h = 10) => new Date(2026, 9, d, h).getTime()
  const current = {
    range: { start: new Date(2026, 9, 12), end: new Date(2026, 9, 15) },
    sessions: [
      session({ startedAt: day(12) }),
      session({ startedAt: day(12, 18) }),
      session({ startedAt: day(14) }),
    ],
  }
  const previous = {
    range: { start: new Date(2026, 9, 9), end: new Date(2026, 9, 12) },
    sessions: [session({ startedAt: day(9) }), session({ startedAt: day(11) })],
  }

  it('creates one bucket per day', () => {
    expect(bucketStarts(current.range, 'day')).toHaveLength(3)
    expect(
      bucketStarts({ start: current.range.start, end: new Date(2026, 9, 13) }, 'hour'),
    ).toHaveLength(24)
  })

  it('aligns current and previous periods bucket by bucket', () => {
    const points = timeseries(current, previous, 'day', 'visits', new Date(2026, 9, 20))
    expect(points.map((p) => [p.current, p.previous])).toEqual([
      [2, 1],
      [0, 0],
      [1, 1],
    ])
  })

  it('leaves future buckets empty', () => {
    const points = timeseries(current, previous, 'day', 'visits', new Date(2026, 9, 13, 9))
    expect(points.map((p) => p.current)).toEqual([2, 0, null])
  })
})

describe('channelTimeseries', () => {
  it('counts visits per channel in each bucket and leaves future buckets empty', () => {
    const range = { start: new Date(2026, 9, 12), end: new Date(2026, 9, 15) }
    const at = (d: number) => new Date(2026, 9, d, 10).getTime()
    const points = channelTimeseries(
      [
        session({ startedAt: at(12), channel: 'organic' }),
        session({ startedAt: at(12), channel: 'social' }),
        session({ startedAt: at(13), channel: 'organic' }),
      ],
      range,
      'day',
      new Date(2026, 9, 13, 18),
    )
    expect(points.map((p) => p.visits && [p.visits.organic, p.visits.social])).toEqual([
      [1, 1],
      [1, 0],
      null,
    ])
  })
})
