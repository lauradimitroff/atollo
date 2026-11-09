import { describe, expect, it } from 'vitest'

import router from './index'

describe('router', () => {
  it('redirects the root to the first site overview', async () => {
    await router.push('/')
    expect(router.currentRoute.value.name).toBe('overview')
    expect(router.currentRoute.value.params.siteId).toBe('atelier-nord')
  })

  it('redirects a bare site URL to its overview', async () => {
    await router.push('/s/studio-brume')
    expect(router.currentRoute.value.fullPath).toBe('/s/studio-brume/overview')
  })

  it('shows the 404 page for an unknown site', async () => {
    await router.push('/s/inconnu/traffic')
    expect(router.currentRoute.value.name).toBe('not-found')
  })

  it('opens the profile tab by default in settings', async () => {
    await router.push('/settings')
    expect(router.currentRoute.value.name).toBe('settings-profile')
    expect(document.title).toBe('Paramètres · Atollo')
  })
})
