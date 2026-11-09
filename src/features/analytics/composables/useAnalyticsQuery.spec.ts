import { describe, expect, it } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'

import router from '@/router'
import type { AnalyticsQuery } from '../data'
import { useAnalyticsQuery } from './useAnalyticsQuery'

/** A promise resolved by hand, to control the order in which answers arrive. */
function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((r) => (resolve = r))
  return { promise, resolve }
}

function setup<T>(load: (q: AnalyticsQuery) => Promise<T>, deps?: () => unknown) {
  let state!: ReturnType<typeof useAnalyticsQuery<T>>
  const Host = defineComponent({
    setup() {
      state = useAnalyticsQuery(load, deps)
      return () => null
    },
  })
  mount(Host, { global: { plugins: [router] } })
  return state
}

describe('useAnalyticsQuery', () => {
  it('loads for the current site and period', async () => {
    await router.push('/s/studio-brume/overview?period=7d')
    const state = setup(async (q) => q.siteId)

    expect(state.loading.value).toBe(true)
    await flushPromises()
    expect(state.data.value).toBe('studio-brume')
    expect(state.loading.value).toBe(false)
  })

  it('ignores a slow answer that arrives after a newer one', async () => {
    await router.push('/s/atelier-nord/overview?period=7d')
    const answers: ReturnType<typeof deferred<string>>[] = []
    const state = setup((q) => {
      const answer = deferred<string>()
      answers.push(answer)
      return answer.promise.then(() => q.granularity)
    })

    await router.push('/s/atelier-nord/overview?period=today')
    await nextTick()
    expect(answers).toHaveLength(2)

    answers[1]!.resolve('') // the newer request (today) answers first…
    await flushPromises()
    answers[0]!.resolve('') // …then the outdated one (7d)
    await flushPromises()

    expect(state.data.value).toBe('hour')
  })

  it('reloads when a declared dependency changes', async () => {
    await router.push('/s/atelier-nord/overview')
    const metric = ref('visits')
    const state = setup(
      async () => metric.value,
      () => metric.value,
    )
    await flushPromises()

    metric.value = 'pageviews'
    await flushPromises()

    expect(state.data.value).toBe('pageviews')
  })

  it('exposes errors', async () => {
    await router.push('/s/atelier-nord/overview')
    const state = setup(async () => {
      throw new Error('Réseau indisponible')
    })
    await flushPromises()

    expect(state.error.value?.message).toBe('Réseau indisponible')
    expect(state.loading.value).toBe(false)
  })
})
