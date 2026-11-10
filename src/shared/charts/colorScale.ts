/**
 * Sequential color scale for the choropleth map: one hue, light to dark.
 *
 * Visits are very unevenly spread (a French site gets most of them from France), so a
 * linear scale would paint one country dark and every other one almost blank. A
 * logarithmic position keeps the small countries visible while the order stays exact.
 */

/** Position of a value on the scale, 0 → 1. 0 for no visit, 1 for the maximum. */
export function scalePosition(value: number, max: number): number {
  if (value <= 0 || max <= 0) return 0
  if (max === 1) return 1
  return Math.log(value) / Math.log(max)
}

/** Linear blend of two "#rrggbb" colors; t = 0 gives `from`, t = 1 gives `to`. */
export function mixHex(from: string, to: string, t: number): string {
  const parse = (hex: string) => {
    const v = hex.replace('#', '')
    return [0, 2, 4].map((i) => parseInt(v.slice(i, i + 2), 16))
  }
  const a = parse(from)
  const b = parse(to)
  const clamped = Math.min(1, Math.max(0, t))
  return `#${a
    .map((channel, i) => Math.round(channel + ((b[i] ?? channel) - channel) * clamped))
    .map((channel) => channel.toString(16).padStart(2, '0'))
    .join('')}`
}

/**
 * Fill of a country with visits. Starts at 18 % of the way to the accent, so the
 * country with the fewest visits is still distinct from countries without any.
 */
export function choroplethColor(value: number, max: number, base: string, accent: string) {
  return mixHex(base, accent, 0.18 + 0.82 * scalePosition(value, max))
}
