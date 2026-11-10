import { nextTick, ref, watch } from 'vue'

import { useTheme } from '@/shared/composables/useTheme'

export interface ChartTokens {
  surface: string
  surfaceMuted: string
  line: string
  lineStrong: string
  fg: string
  fgMuted: string
  fgSubtle: string
  accent: string
  gradA: string
  gradB: string
  gradC: string
  areaOpacity: number
  up: string
  down: string
  /** Categorical palette, in order: one color per series. */
  categorical: string[]
}

/**
 * ECharts draws in SVG/canvas: it cannot read Tailwind classes. This composable reads
 * the design tokens (CSS variables) and re-reads them whenever the theme changes,
 * so charts follow light / dark mode like the rest of the UI.
 */
export function useChartTheme() {
  const { resolved } = useTheme()

  function read(): ChartTokens {
    const style = getComputedStyle(document.documentElement)
    const v = (name: string) => style.getPropertyValue(`--${name}`).trim()
    return {
      surface: v('surface'),
      surfaceMuted: v('surface-muted'),
      line: v('line'),
      lineStrong: v('line-strong'),
      fg: v('fg'),
      fgMuted: v('fg-muted'),
      fgSubtle: v('fg-subtle'),
      accent: v('accent'),
      gradA: v('grad-a'),
      gradB: v('grad-b'),
      gradC: v('grad-c'),
      areaOpacity: Number(v('area-opacity')) || 0.16,
      up: v('up'),
      down: v('down'),
      categorical: [1, 2, 3, 4, 5, 6].map((n) => v(`cat-${n}`)),
    }
  }

  const tokens = ref(read())
  // The .dark class is applied right after the preference changes: read on the next tick.
  watch(resolved, async () => {
    await nextTick()
    tokens.value = read()
  })

  return tokens
}

/** "#7988e7" + 0.3 → "rgba(121, 136, 231, 0.3)", for gradient stops. */
export function withAlpha(hex: string, alpha: number): string {
  const value = hex.replace('#', '')
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16))
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
