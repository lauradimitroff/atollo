import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import type { Kpis } from '../domain/metrics'
import KpiStrip from './KpiStrip.vue'

const kpis: Kpis = {
  visitors: { current: 38412, previous: 34174, change: 0.124 },
  visits: { current: 52870, previous: 48150, change: 0.098 },
  pageviews: { current: 141236, previous: 133120, change: 0.061 },
  bounceRate: { current: 0.413, previous: 0.439, change: -2.6 },
  avgDuration: { current: 168, previous: 175, change: -0.042 },
}

describe('KpiStrip', () => {
  it('shows each metric with its value and change', () => {
    const wrapper = mount(KpiStrip, { props: { kpis, loading: false, modelValue: 'visitors' } })
    const items = wrapper.findAll('[role="radio"]')

    expect(items).toHaveLength(5)
    expect(items[0]!.text()).toContain('Visiteurs uniques')
    expect(items[0]!.text()).toContain('38 412')
    expect(items[0]!.text()).toContain('+12,4')
    // A falling bounce rate is good news: shown in green.
    expect(items[3]!.find('.text-up').exists()).toBe(true)
    // A shorter visit duration is bad news: shown in red.
    expect(items[4]!.find('.text-down').exists()).toBe(true)
  })

  it('selects the metric shown on the chart', async () => {
    const wrapper = mount(KpiStrip, { props: { kpis, loading: false, modelValue: 'visitors' } })

    await wrapper.findAll('[role="radio"]')[3]!.trigger('click')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['bounceRate'])
  })

  it('shows skeletons before the first load', () => {
    const wrapper = mount(KpiStrip, {
      props: { kpis: null, loading: true, modelValue: 'visitors' },
    })
    expect(wrapper.findAll('[aria-hidden="true"].motion-safe\\:animate-pulse').length).toBe(10)
  })
})
