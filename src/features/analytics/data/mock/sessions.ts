import { addDays, startOfDay } from 'date-fns'

import { toDayString, type DateRange } from '../../domain/period'
import type { Session } from '../../domain/types'
import { generateDay } from './generator'

/**
 * Memoized days: going back and forth between periods never regenerates a day.
 * Worst case (1-year custom range + its comparison year, 3 sites) stays a few
 * hundred thousand sessions, acceptable for a demo kept in memory.
 */
const dayCache = new Map<string, Session[]>()

function sessionsOfDay(siteId: string, day: Date): Session[] {
  const key = `${siteId}:${toDayString(day)}`
  let sessions = dayCache.get(key)
  if (!sessions) {
    sessions = generateDay(siteId, day)
    dayCache.set(key, sessions)
  }
  return sessions
}

/**
 * Sessions started within [range.start, range.end), excluding the future:
 * "today" only contains what already happened, like a live analytics tool.
 */
export function getSessions(siteId: string, range: DateRange, now: Date = new Date()): Session[] {
  const from = range.start.getTime()
  const to = Math.min(range.end.getTime(), now.getTime())
  const result: Session[] = []

  for (let day = startOfDay(range.start); day.getTime() < to; day = addDays(day, 1)) {
    for (const session of sessionsOfDay(siteId, day)) {
      if (session.startedAt >= from && session.startedAt < to) result.push(session)
    }
  }
  return result
}
