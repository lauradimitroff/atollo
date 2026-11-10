import { describe, expect, it } from 'vitest'

import { initials } from './initials'

describe('initials', () => {
  it('keeps the first letter of the first two words', () => {
    expect(initials('Laure Martin')).toBe('LM')
    expect(initials('  élodie   de la Tour ')).toBe('ÉD')
    expect(initials('Alex')).toBe('A')
  })
})
