import { describe, expect, it } from 'vitest'

import { formatDateRange } from './format'

const NOW = new Date(2026, 10, 9, 14, 35)

describe('formatDateRange', () => {
  it('shows the last included day, not the exclusive end', () => {
    const range = { start: new Date(2026, 9, 11), end: new Date(2026, 10, 10) }
    expect(formatDateRange(range, NOW)).toBe('11 oct. – 9 nov.')
  })

  it('adds the year when the range reaches into another year', () => {
    const range = { start: new Date(2025, 11, 20), end: new Date(2026, 0, 10) }
    expect(formatDateRange(range, NOW)).toBe('20 déc. 2025 – 9 janv. 2026')
  })

  it('shows hours for a 24-hour range', () => {
    const range = { start: new Date(2026, 10, 8, 15), end: new Date(2026, 10, 9, 15) }
    expect(formatDateRange(range, NOW)).toBe('8 nov., 15:00 – 9 nov., 15:00')
  })
})
