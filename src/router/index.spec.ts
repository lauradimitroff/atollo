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

  it('sends a signed-out visitor to sign in, remembering the page asked for', async () => {
    localStorage.removeItem('atollo-session')
    await router.push('/s/studio-brume/pages?period=7d')
    expect(router.currentRoute.value.name).toBe('login')
    expect(router.currentRoute.value.query.redirect).toBe('/s/studio-brume/pages?period=7d')
  })

  it('sends a signed-in user away from the sign-in page', async () => {
    await router.push('/login')
    expect(router.currentRoute.value.name).toBe('sites')
  })

  it('opens the profile tab by default in settings', async () => {
    await router.push('/settings')
    expect(router.currentRoute.value.name).toBe('settings-profile')
    expect(document.title).toBe('Paramètres · Atollo')
  })
})
