import { describe, expect, it } from 'vitest'
import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'

import router from '@/router'
import { usePeriod } from './usePeriod'

function setup() {
  let result!: ReturnType<typeof usePeriod>
  const Host = defineComponent({
    setup() {
      result = usePeriod()
      return () => null
    },
  })
  mount(Host, { global: { plugins: [router] } })
  return result
}

describe('usePeriod', () => {
  it('defaults to 30 days with a clean URL', async () => {
    await router.push('/s/atelier-nord/overview')
    const { period, query, granularity } = setup()

    expect(period.value).toEqual({ preset: '30d' })
    expect(query.value).toEqual({})
    expect(granularity.value).toBe('day')
  })

  it('writes the preset to the URL and keeps unrelated params', async () => {
    await router.push('/s/atelier-nord/pages?sort=visitors')
    const { setPreset, period, granularity } = setup()

    await setPreset('24h')

    expect(router.currentRoute.value.query).toEqual({ sort: 'visitors', period: '24h' })
    expect(period.value).toEqual({ preset: '24h' })
    expect(granularity.value).toBe('hour')
  })

  it('removes from/to when leaving a custom range', async () => {
    await router.push('/s/atelier-nord/overview?period=custom&from=2026-10-01&to=2026-10-15')
    const { setPreset } = setup()

    await setPreset('7d')

    expect(router.currentRoute.value.query).toEqual({ period: '7d' })
  })

  it('compares with a previous range of the same length', async () => {
    await router.push('/s/atelier-nord/overview?period=7d')
    const { range, comparisonRange } = setup()

    const length = range.value.end.getTime() - range.value.start.getTime()
    expect(comparisonRange.value.end).toEqual(range.value.start)
    expect(comparisonRange.value.end.getTime() - comparisonRange.value.start.getTime()).toBe(length)
  })
})
