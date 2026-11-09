/**
 * The overview's failure and empty states, which cannot be reproduced by hand with the
 * demo data: the data layer is replaced by a controllable fake.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

import router from '@/router'
import type { AnalyticsRepository } from '../data'
import type { Kpis } from '../domain/metrics'
import OverviewView from './OverviewView.vue'

const { analytics } = vi.hoisted(() => ({
  analytics: {
    getKpis: vi.fn<AnalyticsRepository['getKpis']>(),
    // Never resolves: the chart stays in its loading state, ECharts is not needed here.
    getTimeseries: vi.fn<AnalyticsRepository['getTimeseries']>(() => new Promise(() => {})),
    getBreakdown: vi.fn<AnalyticsRepository['getBreakdown']>(async () => []),
    getPages: vi.fn<AnalyticsRepository['getPages']>(async () => []),
  },
}))
vi.mock('../data', () => ({ analytics }))

const zero = { current: 0, previous: 0, change: null }
const emptyKpis: Kpis = {
  visitors: zero,
  visits: zero,
  pageviews: zero,
  bounceRate: zero,
  avgDuration: zero,
}

async function mountOverview(url: string) {
  await router.push(url)
  const wrapper = mount(OverviewView, { global: { plugins: [router] } })
  await flushPromises()
  return wrapper
}

describe('OverviewView states', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows an error with a retry when the KPIs fail to load', async () => {
    analytics.getKpis.mockRejectedValueOnce(new Error('Réseau indisponible'))
    const wrapper = await mountOverview('/s/atelier-nord/overview')

    expect(wrapper.text()).toContain('Les indicateurs n’ont pas pu être chargés.')

    analytics.getKpis.mockResolvedValueOnce(emptyKpis)
    await wrapper.get('[role="alert"] button').trigger('click')
    await flushPromises()

    expect(analytics.getKpis).toHaveBeenCalledTimes(2)
    expect(wrapper.text()).not.toContain('Les indicateurs n’ont pas pu être chargés.')
  })

  it('explains an empty period and offers a longer one', async () => {
    analytics.getKpis.mockResolvedValue(emptyKpis)
    const wrapper = await mountOverview('/s/atelier-nord/overview?period=today')

    expect(wrapper.text()).toContain('Aucune visite sur cette période')
    // The cards would only repeat "no data": they are hidden.
    expect(wrapper.find('[aria-labelledby]').exists()).toBe(false)

    await wrapper
      .findAll('button')
      .find((b) => b.text() === 'Voir les 30 derniers jours')!
      .trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.query.period).toBeUndefined() // 30 days = default
  })

  it('suggests clearing the filters when they match nothing', async () => {
    analytics.getKpis.mockResolvedValue(emptyKpis)
    const wrapper = await mountOverview('/s/atelier-nord/overview?campaign=inexistante')

    expect(wrapper.text()).toContain('Aucune visite ne correspond à ces filtres')

    await wrapper
      .findAll('button')
      .find((b) => b.text() === 'Effacer les filtres')!
      .trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.query.campaign).toBeUndefined()
  })
})
