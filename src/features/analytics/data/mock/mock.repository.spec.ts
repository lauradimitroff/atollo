/**
 * Consistency between statistics: the same visits counted through different
 * paths (KPIs, chart, breakdowns, pages) must always give the same totals.
 */
import { describe, expect, it } from 'vitest'

import type { Filter } from '../../domain/filters'
import { granularityFor, previousRange, resolveRange, type Period } from '../../domain/period'
import type { AnalyticsQuery } from '../repository'
import { createMockRepository } from './mock.repository'

const NOW = new Date(2026, 10, 9, 14, 35)
const repo = createMockRepository({ latency: [0, 0], now: () => NOW })

function queryFor(period: Period, siteId = 'atelier-nord', filters: Filter[] = []): AnalyticsQuery {
  const range = resolveRange(period, NOW)
  const granularity = granularityFor(range)
  return { siteId, range, granularity, comparisonRange: previousRange(range, granularity), filters }
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
    const bakery = await repo.getKpis(
      queryFor({ preset: 'custom', from: '2026-10-01', to: '2026-10-31' }, 'mie-celeste'),
    )
    expect(atelier.visitors.current).toBeLessThanOrEqual(atelier.visits.current)
    expect(bakery.visits.current).toBeLessThan(atelier.visits.current / 2)
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

describe('cross filters', () => {
  const organic = queryFor(
    { preset: 'custom', from: '2026-10-01', to: '2026-10-31' },
    'atelier-nord',
    [{ dimension: 'channel', value: 'organic' }],
  )

  it('filtered visits equal the row that was clicked', async () => {
    const [channels, filtered] = await Promise.all([
      repo.getBreakdown(october, 'channel'),
      repo.getKpis(organic),
    ])
    const organicRow = channels.find((row) => row.key === 'organic')!
    expect(filtered.visits.current).toBe(organicRow.visits)
    expect(filtered.visitors.current).toBe(organicRow.visitors)
  })

  it('filters the comparison period too', async () => {
    const september = queryFor(
      { preset: 'custom', from: '2026-08-31', to: '2026-09-30' },
      'atelier-nord',
      [{ dimension: 'channel', value: 'organic' }],
    )
    const [octoberKpis, septemberKpis] = await Promise.all([
      repo.getKpis(organic),
      repo.getKpis(september),
    ])
    expect(octoberKpis.visits.previous).toBe(septemberKpis.visits.current)
  })

  it('combines filters across cards', async () => {
    const mobileOrganic = {
      ...organic,
      filters: [...organic.filters, { dimension: 'device' as const, value: 'mobile' }],
    }
    const [devices, kpis] = await Promise.all([
      repo.getBreakdown(organic, 'device'),
      repo.getKpis(mobileOrganic),
    ])
    expect(kpis.visits.current).toBe(devices.find((row) => row.key === 'mobile')!.visits)
  })
})

describe('site summaries (multi-site overview)', () => {
  it('match each site’s own KPIs', async () => {
    const [summaries, atelier, brume] = await Promise.all([
      repo.getSiteSummaries(october, ['atelier-nord', 'studio-brume']),
      repo.getKpis(october),
      repo.getKpis({ ...october, siteId: 'studio-brume' }),
    ])
    expect(summaries.map((s) => s.siteId)).toEqual(['atelier-nord', 'studio-brume'])
    expect(summaries[0]!.visitors).toEqual(atelier.visitors)
    expect(summaries[1]!.bounceRate).toEqual(brume.bounceRate)
  })

  it('gives one trend point per day of the period', async () => {
    const [summary] = await repo.getSiteSummaries(october, ['mie-celeste'])
    expect(summary!.trend).toHaveLength(31)
  })

  it('shows no visit at all for the site without tracking', async () => {
    const [summary] = await repo.getSiteSummaries(october, ['maison-tilleul'])
    expect(summary!.visitors).toEqual({ current: 0, previous: 0, change: null })
  })
})

describe('page behavior', () => {
  it('visitors leave more often from contact and articles than from the home page', async () => {
    const pages = Object.fromEntries((await repo.getPages(october)).map((p) => [p.path, p]))
    expect(pages['/contact']!.exitRate).toBeGreaterThan(pages['/']!.exitRate + 0.2)
    expect(pages['/blog/design-tokens']!.exitRate).toBeGreaterThan(pages['/projets']!.exitRate)
  })
})
