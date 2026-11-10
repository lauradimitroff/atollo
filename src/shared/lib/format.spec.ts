import { describe, expect, it } from 'vitest'

import { formatDateRange, formatDecimal, formatDuration, formatNumber } from './format'

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

  it('shows a single day without a range', () => {
    const range = { start: new Date(2026, 10, 9), end: new Date(2026, 10, 10) }
    expect(formatDateRange(range, NOW)).toBe('9 nov.')
  })

  it('shows hours for a range not aligned on midnight', () => {
    const range = { start: new Date(2026, 10, 8, 15), end: new Date(2026, 10, 9, 15) }
    expect(formatDateRange(range, NOW)).toBe('8 nov., 15:00 – 9 nov., 15:00')
  })
})

describe('formatDecimal', () => {
  it('always shows one decimal, with a French comma', () => {
    expect(formatDecimal(2.43)).toBe('2,4')
    expect(formatDecimal(3)).toBe('3,0')
  })
})

describe('formatNumber', () => {
  it('uses the French thousands separator', () => {
    // Intl uses a narrow no-break space (U+202F) in French.
    expect(formatNumber(141236.4)).toBe('141 236')
  })
})

describe('formatDuration', () => {
  it.each([
    [0, '0 s'],
    [45, '45 s'],
    [125, '2 min 05 s'],
    [3780, '1 h 03 min'],
  ])('%i s → %s', (seconds, expected) => {
    expect(formatDuration(seconds)).toBe(expected)
  })
})
