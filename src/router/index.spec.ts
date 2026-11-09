import { describe, expect, it } from 'vitest'

import router from './index'

describe('router', () => {
  it('opens the multi-site overview at the root', async () => {
    await router.push('/')
    expect(router.currentRoute.value.name).toBe('sites')
    expect(document.title).toBe('Tous les sites · Atollo')
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
