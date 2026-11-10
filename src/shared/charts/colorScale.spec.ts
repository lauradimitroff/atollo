import { describe, expect, it } from 'vitest'

import { choroplethColor, mixHex, scalePosition } from './colorScale'

describe('scalePosition', () => {
  it('maps no visit to 0 and the maximum to 1', () => {
    expect(scalePosition(0, 500)).toBe(0)
    expect(scalePosition(500, 500)).toBe(1)
    expect(scalePosition(1, 1)).toBe(1)
  })

  it('is logarithmic: small countries stay visible, the order is kept', () => {
    expect(scalePosition(10, 1000)).toBeCloseTo(1 / 3)
    expect(scalePosition(100, 1000)).toBeCloseTo(2 / 3)
    expect(scalePosition(5, 1000)).toBeLessThan(scalePosition(6, 1000))
  })
})

describe('mixHex', () => {
  it('blends two colors channel by channel', () => {
    expect(mixHex('#000000', '#ffffff', 0)).toBe('#000000')
    expect(mixHex('#000000', '#ffffff', 1)).toBe('#ffffff')
    expect(mixHex('#000000', '#ffffff', 0.5)).toBe('#808080')
    expect(mixHex('#000000', '#ffffff', 3)).toBe('#ffffff')
  })
})

describe('choroplethColor', () => {
  it('never paints a country with visits like one without', () => {
    expect(choroplethColor(1, 10_000, '#000000', '#ffffff')).not.toBe('#000000')
    expect(choroplethColor(10_000, 10_000, '#000000', '#ffffff')).toBe('#ffffff')
  })
})
