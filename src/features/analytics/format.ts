import { formatDuration, formatNumber, formatPercent } from '@/shared/lib/format'
import { METRICS, type MetricKey } from './domain/metrics'
import type { Granularity } from './domain/period'

const signedPercent = new Intl.NumberFormat('fr-FR', {
  style: 'percent',
  maximumFractionDigits: 1,
  signDisplay: 'exceptZero',
})
const signedNumber = new Intl.NumberFormat('fr-FR', {
  maximumFractionDigits: 1,
  signDisplay: 'exceptZero',
})

/** A metric value in its own unit: "38 412", "41,3 %", "2 min 48 s". */
export function formatMetric(key: MetricKey, value: number): string {
  switch (METRICS[key].format) {
    case 'percent':
      return formatPercent(value)
    case 'duration':
      return formatDuration(value)
    default:
      return formatNumber(value)
  }
}

/** A change in its own unit: "+12,4 %", "−2,6 pts", "—" when not comparable. */
export function formatChange(key: MetricKey, change: number | null): string {
  if (change === null) return '—'
  return METRICS[key].changeUnit === 'points'
    ? `${signedNumber.format(change)} pts`
    : signedPercent.format(change)
}

const compact = new Intl.NumberFormat('fr-FR', { notation: 'compact', maximumFractionDigits: 1 })
const wholePercent = new Intl.NumberFormat('fr-FR', { style: 'percent', maximumFractionDigits: 0 })

/** Short y-axis labels: "1,2 k", "40 %", "2 min". */
export function formatAxis(key: MetricKey, value: number): string {
  switch (METRICS[key].format) {
    case 'percent':
      return wholePercent.format(value)
    case 'duration':
      return value < 60 ? `${Math.round(value)} s` : `${Math.round(value / 60)} min`
    default:
      return compact.format(value)
  }
}

const axisFormats: Record<Granularity, Intl.DateTimeFormat> = {
  hour: new Intl.DateTimeFormat('fr-FR', { hour: 'numeric' }),
  day: new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' }),
  week: new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' }),
}
const tooltipFormats: Record<Granularity, Intl.DateTimeFormat> = {
  hour: new Intl.DateTimeFormat('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }),
  day: new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }),
  week: new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long' }),
}

/** Labels of a chart point: "9 nov." on the axis, "lundi 9 novembre" in the tooltip. */
export function bucketLabels(start: number, granularity: Granularity) {
  const tooltip = tooltipFormats[granularity].format(start)
  return {
    axisLabel: axisFormats[granularity].format(start),
    tooltipLabel: granularity === 'week' ? `Semaine du ${tooltip}` : tooltip,
  }
}

/** Change between two raw values, in the metric's own unit. */
export function formatChangeBetween(key: MetricKey, current: number, previous: number): string {
  const change =
    METRICS[key].changeUnit === 'points'
      ? (current - previous) * 100
      : previous
        ? (current - previous) / previous
        : null
  return formatChange(key, change).replace('-', '−')
}
