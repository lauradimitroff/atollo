/**
 * Consistency between statistics: the same visits counted through different
 * paths (KPIs, chart, breakdowns, pages) must always give the same totals.
 */
import { describe, expect, it } from 'vitest'

import { granularityFor, previousRange, resolveRange, type Period } from '../../domain/period'
import type { AnalyticsQuery } from '../repository'
import { createMockRepository } from './mock.repository'

const NOW = new Date(2026, 10, 9, 14, 35)
const repo = createMockRepository({ latency: [0, 0], now: () => NOW })

function queryFor(period: Period, siteId = 'atelier-nord'): AnalyticsQuery {
  const range = resolveRange(period, NOW)
  const granularity = granularityFor(range)
  return { siteId, range, granularity, comparisonRange: previousRange(range, granularity) }
}

// A finished period: no clipping to "now", every total is directly comparable.
const october = queryFor({ preset: 'custom', from: '2026-10-01', to: '2026-10-31' })

const sum = (values: (number | null)[]) => values.reduce<number>((a, b) => a + (b ?? 0), 0)

describe('mock repository consistency', () => {
  it('channels add up to the total visits', async () => {
    const [kpis, channels] = await Promise.all([
      repo.getKpis(october),
      repo.getBreakdown(october, 'channel'),
    ])
    expect(sum(channels.map((c) => c.visits))).toBe(kpis.visits.current)
    expect(sum(channels.map((c) => c.share))).toBeCloseTo(1)
  })

  it('the chart adds up to the KPIs for additive metrics', async () => {
    const kpis = await repo.getKpis(october)
    const visits = await repo.getTimeseries(october, 'visits')
    const pageviews = await repo.getTimeseries(october, 'pageviews')

    expect(visits).toHaveLength(31)
    expect(sum(visits.map((p) => p.current))).toBe(kpis.visits.current)
    expect(sum(visits.map((p) => p.previous))).toBe(kpis.visits.previous)
    expect(sum(pageviews.map((p) => p.current))).toBe(kpis.pageviews.current)
  })

  it('pages add up to the total pageviews, entries and exits to the visits', async () => {
    const [kpis, pages] = await Promise.all([repo.getKpis(october), repo.getPages(october)])
    expect(sum(pages.map((p) => p.pageviews))).toBe(kpis.pageviews.current)
    expect(sum(pages.map((p) => p.entries))).toBe(kpis.visits.current)
    expect(sum(pages.map((p) => p.exits))).toBe(kpis.visits.current)
  })

  it('the "previous" value is exactly the previous period’s own value', async () => {
    const september = queryFor({ preset: 'custom', from: '2026-08-31', to: '2026-09-30' })
    const [octoberKpis, septemberKpis] = await Promise.all([
      repo.getKpis(october),
      repo.getKpis(september),
    ])
    expect(octoberKpis.visitors.previous).toBe(septemberKpis.visitors.current)
    expect(octoberKpis.bounceRate.previous).toBe(septemberKpis.bounceRate.current)
  })

  it('unique visitors never exceed visits, and differ between sites', async () => {
    const atelier = await repo.getKpis(october)
    const fournil = await repo.getKpis(
      queryFor({ preset: 'custom', from: '2026-10-01', to: '2026-10-31' }, 'mie-celeste'),
    )
    expect(atelier.visitors.current).toBeLessThanOrEqual(atelier.visits.current)
    expect(fournil.visits.current).toBeLessThan(atelier.visits.current / 2)
  })

  it('keeps realistic values', async () => {
    const kpis = await repo.getKpis(october)
    expect(kpis.bounceRate.current).toBeGreaterThan(0.35)
    expect(kpis.bounceRate.current).toBeLessThan(0.7)
    expect(kpis.avgDuration.current).toBeGreaterThan(30)
    expect(kpis.avgDuration.current).toBeLessThan(600)
  })

  it('does not show a fake drop for a period still running', async () => {
    // "Today" is 14:35: comparing with a full previous day would halve the numbers.
    const today = await repo.getKpis(queryFor({ preset: '7d' }))
    expect(today.visits.change).toBeGreaterThan(-0.3)
  })
})
