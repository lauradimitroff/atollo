import { describe, expect, it } from 'vitest'

import { countryFlag, countryName } from './labels'

describe('country labels', () => {
  it('names countries in French', () => {
    expect(countryName('FR')).toBe('France')
    expect(countryName('DE')).toBe('Allemagne')
  })

  it('builds the flag emoji from the code', () => {
    expect(countryFlag('FR')).toBe('🇫🇷')
    expect(countryFlag('fr')).toBe('')
  })
})
