import { describe, expect, it } from 'vitest'

import { createRandom, hashString } from './random'

describe('createRandom', () => {
  it('returns the same sequence for the same seed', () => {
    const a = createRandom(42)
    const b = createRandom(42)
    const sequence = () => Array.from({ length: 5 }, () => a.next())
    expect(sequence()).toEqual(Array.from({ length: 5 }, () => b.next()))
  })

  it('returns a different sequence for another seed', () => {
    expect(createRandom(1).next()).not.toBe(createRandom(2).next())
  })

  it('keeps int() within bounds, both included', () => {
    const random = createRandom(7)
    const values = new Set(Array.from({ length: 500 }, () => random.int(1, 3)))
    expect([...values].sort()).toEqual([1, 2, 3])
  })

  it('respects weights roughly', () => {
    const random = createRandom(123)
    const draws = Array.from({ length: 10_000 }, () =>
      random.weighted([
        ['a', 80],
        ['b', 20],
      ]),
    )
    const shareA = draws.filter((d) => d === 'a').length / draws.length
    expect(shareA).toBeGreaterThan(0.77)
    expect(shareA).toBeLessThan(0.83)
  })
})

describe('hashString', () => {
  it('is stable and spreads similar strings apart', () => {
    expect(hashString('atelier-nord:2026-11-09')).toBe(hashString('atelier-nord:2026-11-09'))
    expect(hashString('atelier-nord:2026-11-09')).not.toBe(hashString('atelier-nord:2026-11-10'))
  })
})
