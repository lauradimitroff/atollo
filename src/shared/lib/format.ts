/**
 * Display formatting, French locale.
 * Intl formatters are created once: building them is relatively costly.
 */
import { subMilliseconds } from 'date-fns'

const dayMonth = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' })
const dayMonthYear = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})
const dayMonthHour = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

/**
 * "11 oct. – 9 nov." for a half-open range [start, end).
 * The year appears only when the range is not entirely in the current year.
 * Ranges shorter than a day show hours: "8 nov. 15:00 – 9 nov. 15:00".
 */
export function formatDateRange(range: { start: Date; end: Date }, now: Date = new Date()): string {
  const durationHours = (range.end.getTime() - range.start.getTime()) / 3_600_000
  if (durationHours <= 24) {
    return `${dayMonthHour.format(range.start)} – ${dayMonthHour.format(range.end)}`
  }

  const lastDay = subMilliseconds(range.end, 1)
  const sameYear =
    range.start.getFullYear() === now.getFullYear() && lastDay.getFullYear() === now.getFullYear()
  const formatter = sameYear ? dayMonth : dayMonthYear
  return `${formatter.format(range.start)} – ${formatter.format(lastDay)}`
}

const integer = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 })

/** "141 236" (French thousands separator). */
export function formatNumber(value: number): string {
  return integer.format(value)
}

/** "2 min 05 s", "45 s", "1 h 03 min". */
export function formatDuration(totalSeconds: number): string {
  const seconds = Math.round(totalSeconds)
  if (seconds < 60) return `${seconds} s`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} min ${String(seconds % 60).padStart(2, '0')} s`
  return `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, '0')} min`
}
