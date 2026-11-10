import { describe, expect, it } from 'vitest'

import { safeRedirect } from './redirect'

describe('safeRedirect', () => {
  it('keeps paths of the app, with their query', () => {
    expect(safeRedirect('/s/atelier-nord/pages?period=7d')).toBe('/s/atelier-nord/pages?period=7d')
  })

  it('refuses anything that leads to another site', () => {
    for (const value of [
      'https://evil.example',
      '//evil.example',
      '/\\evil.example',
      'javascript:alert(1)',
      '',
      ['/sites'],
      undefined,
    ]) {
      expect(safeRedirect(value)).toBeNull()
    }
  })
})
