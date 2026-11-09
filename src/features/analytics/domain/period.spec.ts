import { describe, expect, it } from 'vitest'

import {
  DEFAULT_PERIOD,
  elapsedRanges,
  granularityFor,
  parsePeriod,
  periodToQuery,
  previousRange,
  resolveRange,
} from './period'

// Monday 9 November 2026, 14:35 local time
const NOW = new Date(2026, 10, 9, 14, 35)

describe('resolveRange', () => {
  it('24h covers the last 24 full hours, current hour included', () => {
    const range = resolveRange({ preset: '24h' }, NOW)
    expect(range.start).toEqual(new Date(2026, 10, 8, 15))
    expect(range.end).toEqual(new Date(2026, 10, 9, 15))
  })

  it('7d covers 7 calendar days ending tonight at midnight', () => {
    const range = resolveRange({ preset: '7d' }, NOW)
    expect(range.start).toEqual(new Date(2026, 10, 3))
    expect(range.end).toEqual(new Date(2026, 10, 10))
  })

  it('custom includes both the first and the last day', () => {
    const range = resolveRange({ preset: 'custom', from: '2026-10-01', to: '2026-10-15' }, NOW)
    expect(range.start).toEqual(new Date(2026, 9, 1))
    expect(range.end).toEqual(new Date(2026, 9, 16))
  })
})

describe('previousRange', () => {
  it('is the same number of days, right before', () => {
    const range = resolveRange({ preset: '30d' }, NOW)
    const previous = previousRange(range, 'day')
    expect(previous.end).toEqual(range.start)
    expect(previous.start).toEqual(new Date(2026, 8, 11))
  })

  it('works in hours for 24h', () => {
    const range = resolveRange({ preset: '24h' }, NOW)
    const previous = previousRange(range, 'hour')
    expect(previous.start).toEqual(new Date(2026, 10, 7, 15))
    expect(previous.end).toEqual(range.start)
  })

  it('stays aligned on midnight across a daylight-saving change', () => {
    // Europe switched to winter time on 25 October 2026.
    const range = resolveRange({ preset: 'custom', from: '2026-10-20', to: '2026-10-30' }, NOW)
    const previous = previousRange(range, 'day')
    expect(previous.start).toEqual(new Date(2026, 9, 9))
    expect(previous.start.getHours()).toBe(0)
  })
})

describe('granularityFor', () => {
  it.each([
    [{ preset: '24h' } as const, 'hour'],
    [{ preset: '7d' } as const, 'day'],
    [{ preset: '90d' } as const, 'day'],
    [{ preset: 'custom', from: '2026-01-01', to: '2026-11-09' } as const, 'week'],
  ])('%o → %s', (period, expected) => {
    expect(granularityFor(resolveRange(period, NOW))).toBe(expected)
  })
})

describe('parsePeriod', () => {
  it('reads a preset', () => {
    expect(parsePeriod({ period: '7d' }, NOW)).toEqual({ preset: '7d' })
  })

  it('reads a valid custom range', () => {
    expect(parsePeriod({ period: 'custom', from: '2026-10-01', to: '2026-10-15' }, NOW)).toEqual({
      preset: 'custom',
      from: '2026-10-01',
      to: '2026-10-15',
    })
  })

  it.each([
    ['nothing', {}],
    ['an unknown preset', { period: '1y' }],
    ['a malformed date', { period: 'custom', from: '01/10/2026', to: '2026-10-15' }],
    ['an impossible date', { period: 'custom', from: '2026-02-30', to: '2026-03-02' }],
    ['a reversed range', { period: 'custom', from: '2026-10-15', to: '2026-10-01' }],
    ['a future day', { period: 'custom', from: '2026-11-01', to: '2026-11-20' }],
    ['a day older than one year', { period: 'custom', from: '2025-01-01', to: '2025-02-01' }],
  ])('falls back to the default for %s', (_label, query) => {
    expect(parsePeriod(query, NOW)).toEqual(DEFAULT_PERIOD)
  })
})

describe('periodToQuery', () => {
  it('omits the default period', () => {
    expect(periodToQuery({ preset: '30d' })).toEqual({})
  })

  it('round-trips through parsePeriod', () => {
    const period = { preset: 'custom', from: '2026-10-01', to: '2026-10-15' } as const
    expect(parsePeriod(periodToQuery(period), NOW)).toEqual(period)
    expect(parsePeriod(periodToQuery({ preset: '90d' }), NOW)).toEqual({ preset: '90d' })
  })
})

describe('elapsedRanges', () => {
  it('cuts both ranges to the same elapsed time while the period is running', () => {
    const range = resolveRange({ preset: '7d' }, NOW)
    const { current, comparison } = elapsedRanges(range, previousRange(range, 'day'), NOW)

    expect(current.end).toEqual(NOW)
    // 6 days 14 h 35 min after the start, in both periods.
    expect(comparison.end.getTime() - comparison.start.getTime()).toBe(
      current.end.getTime() - current.start.getTime(),
    )
    expect(comparison.end).toEqual(new Date(2026, 10, 2, 14, 35))
  })

  it('leaves a finished period untouched', () => {
    const range = resolveRange({ preset: 'custom', from: '2026-10-01', to: '2026-10-15' }, NOW)
    const previous = previousRange(range, 'day')
    expect(elapsedRanges(range, previous, NOW)).toEqual({ current: range, comparison: previous })
  })
})
