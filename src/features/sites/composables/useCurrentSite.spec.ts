import { describe, expect, it } from 'vitest'
import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'

import router from '@/router'
import { useCurrentSite } from './useCurrentSite'

// A composable that uses the router must run inside a component.
function setup() {
  let result!: ReturnType<typeof useCurrentSite>
  const Host = defineComponent({
    setup() {
      result = useCurrentSite()
      return () => null
    },
  })
  mount(Host, { global: { plugins: [router] } })
  return result
}

describe('useCurrentSite', () => {
  it('reads the site from the URL', async () => {
    await router.push('/s/studio-brume/pages')
    const { site } = setup()
    expect(site.value.name).toBe('Studio Brume')
  })

  it('keeps the current page and query when switching site', async () => {
    await router.push('/s/atelier-nord/traffic?period=7d')
    const { switchSite, site } = setup()

    await switchSite('mie-celeste')

    expect(router.currentRoute.value.fullPath).toBe('/s/mie-celeste/traffic?period=7d')
    expect(site.value.id).toBe('mie-celeste')
  })

  it('goes to the overview when switching from a non-site page', async () => {
    await router.push('/settings/appearance')
    const { switchSite } = setup()

    await switchSite('studio-brume')

    expect(router.currentRoute.value.fullPath).toBe('/s/studio-brume/overview')
  })
})
