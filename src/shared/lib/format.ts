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
