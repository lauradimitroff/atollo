import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

import router from '@/router'
import type { BreakdownItem, BreakdownTab } from './breakdown'
import BreakdownCard from './BreakdownCard.vue'

const item = (key: string, value: number, share: number | null = null): BreakdownItem => ({
  key,
  label: key,
  value,
  share,
})

function tabs(): BreakdownTab[] {
  return [
    {
      key: 'channels',
      filterDimension: 'channel',
      label: 'Canaux',
      columnLabel: 'Canal',
      valueLabel: 'Visites',
      load: vi.fn<BreakdownTab['load']>(async () => [
        item('Direct', 300, 0.6),
        item('Organique', 200, 0.4),
      ]),
    },
    {
      key: 'campaigns',
      filterDimension: 'campaign',
      label: 'Campagnes',
      columnLabel: 'Campagne',
      valueLabel: 'Visites',
      load: vi.fn<BreakdownTab['load']>(async () => []),
    },
  ]
}

async function mountCard(cardTabs: BreakdownTab[]) {
  await router.push('/s/atelier-nord/overview')
  const wrapper = mount(BreakdownCard, {
    props: { title: 'Sources', tabs: cardTabs },
    global: { plugins: [router] },
    attachTo: document.body,
  })
  await flushPromises()
  return wrapper
}

describe('BreakdownCard', () => {
  it('loads and shows only the active tab', async () => {
    const cardTabs = tabs()
    const wrapper = await mountCard(cardTabs)

    expect(cardTabs[0]!.load).toHaveBeenCalledOnce()
    expect(cardTabs[1]!.load).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('Direct')
    expect(wrapper.text()).toContain('60\u00a0%')
    wrapper.unmount()
  })

  it('sizes bars relative to the largest row', async () => {
    const wrapper = await mountCard(tabs())
    const bars = wrapper.findAll('li span[style]').map((b) => b.attributes('style'))

    expect(bars[0]).toContain('width: 100%')
    expect(bars[1]).toMatch(/width: 66\.6+\d*%/)
    wrapper.unmount()
  })

  it('shows an empty state when a tab has no data', async () => {
    const cardTabs = tabs()
    const wrapper = await mountCard(cardTabs)

    const campaigns = wrapper.findAll('[role="tab"]')[1]!
    await campaigns.trigger('mousedown', { button: 0 })
    await flushPromises()

    expect(cardTabs[1]!.load).toHaveBeenCalledOnce()
    expect(wrapper.text()).toContain('Aucune donnée sur cette période.')
    wrapper.unmount()
  })

  it('filters the dashboard when a row is clicked, and unfilters on second click', async () => {
    const wrapper = await mountCard(tabs())
    const direct = wrapper.findAll('button[aria-pressed]')[0]!

    await direct.trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.query.channel).toBe('Direct')
    expect(direct.attributes('aria-pressed')).toBe('true')

    await direct.trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.query.channel).toBeUndefined()
    wrapper.unmount()
  })
})
