import type { AnalyticsQuery } from '../data'
import type { FilterDimension } from '../domain/filters'

/** One displayable row, whatever the dimension (channel, page, country…). */
export interface BreakdownItem {
  key: string
  label: string
  /** Shown before the label: a flag, for instance. */
  prefix?: string
  /** Paths and domains read better in a monospace font. */
  mono?: boolean
  value: number
  /** Share of the total (0 → 1), or null when shares would not add up (pages). */
  share: number | null
}

/** One tab of a breakdown card: what to load and how to title its columns. */
export interface BreakdownTab {
  key: string
  label: string
  columnLabel: string
  valueLabel: string
  /** Clicking a row filters the whole dashboard on this dimension. */
  filterDimension: FilterDimension
  load: (query: AnalyticsQuery) => Promise<BreakdownItem[]>
}
