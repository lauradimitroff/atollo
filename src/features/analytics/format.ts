import { formatDuration, formatNumber, formatPercent } from '@/shared/lib/format'
import { METRICS, type MetricKey } from './domain/metrics'

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
