import { describe, expect, it } from 'vitest'

import { formatChange, formatMetric } from './format'

describe('formatMetric', () => {
  it('formats each metric in its unit', () => {
    expect(formatMetric('visitors', 38412)).toBe('38 412')
    expect(formatMetric('bounceRate', 0.4134)).toBe('41,3 %')
    expect(formatMetric('avgDuration', 168)).toBe('2 min 48 s')
  })
})

describe('formatChange', () => {
  it('signs percent changes and points', () => {
    expect(formatChange('visits', 0.124)).toBe('+12,4 %')
    expect(formatChange('visits', -0.042)).toBe('-4,2 %')
    expect(formatChange('bounceRate', -2.6)).toBe('-2,6 pts')
    expect(formatChange('visits', null)).toBe('—')
  })
})
