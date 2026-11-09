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
const isMidnight = (date: Date) =>
  date.getHours() === 0 && date.getMinutes() === 0 && date.getSeconds() === 0

const dayMonthHour = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

/**
 * "11 oct. – 9 nov." for a half-open range [start, end).
 * The year appears only when the range is not entirely in the current year.
 * A single whole day shows just that day: "9 nov.".
 * Ranges not aligned on midnight show hours: "8 nov., 15:00 – 9 nov., 15:00".
 */
export function formatDateRange(range: { start: Date; end: Date }, now: Date = new Date()): string {
  const lastDay = subMilliseconds(range.end, 1)
  const wholeDays = isMidnight(range.start) && isMidnight(range.end)

  if (!wholeDays) {
    return `${dayMonthHour.format(range.start)} – ${dayMonthHour.format(range.end)}`
  }
  // A single day ("today", or a custom range of one day): "9 nov."
  if (range.start.toDateString() === lastDay.toDateString()) {
    return (range.start.getFullYear() === now.getFullYear() ? dayMonth : dayMonthYear).format(
      range.start,
    )
  }

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

const percent = new Intl.NumberFormat('fr-FR', { style: 'percent', maximumFractionDigits: 1 })

/** 0.413 → "41,3 %". */
export function formatPercent(ratio: number): string {
  return percent.format(ratio)
}
