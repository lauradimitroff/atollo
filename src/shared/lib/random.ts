/**
 * Seeded pseudo-random numbers.
 *
 * `Math.random()` gives different data on every reload: charts would jump around
 * and tests could not assert anything. A seeded generator always returns the same
 * sequence for the same seed, so the demo data is stable yet looks random.
 */

/** A list of values with their relative weights: [['mobile', 60], ['desktop', 40]]. */
export type Weighted<T> = readonly (readonly [value: T, weight: number])[]

export interface Random {
  /** Float in [0, 1). */
  next(): number
  /** Integer in [min, max], both included. */
  int(min: number, max: number): number
  chance(probability: number): boolean
  pick<T>(items: readonly T[]): T
  weighted<T>(entries: Weighted<T>): T
  /** Normally distributed value (Box–Muller transform). */
  normal(mean: number, standardDeviation: number): number
}

/** FNV-1a: turns any string ("atelier-nord:2026-11-09") into a 32-bit seed. */
export function hashString(value: string): number {
  let hash = 0x811c9dc5
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

/** Mulberry32: tiny, fast and statistically good enough for fake data. */
export function createRandom(seed: number): Random {
  let state = seed >>> 0

  function next() {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  return {
    next,
    int: (min, max) => min + Math.floor(next() * (max - min + 1)),
    chance: (probability) => next() < probability,
    pick: (items) => items[Math.floor(next() * items.length)]!,
    weighted(entries) {
      let total = 0
      for (const [, weight] of entries) total += weight
      let roll = next() * total
      for (const [value, weight] of entries) {
        roll -= weight
        if (roll < 0) return value
      }
      return entries[entries.length - 1]![0]
    },
    normal(mean, standardDeviation) {
      const u = 1 - next() // avoid log(0)
      const v = next()
      return mean + standardDeviation * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
    },
  }
}
