import { describe, expect, it } from 'vitest'
import { addDays } from 'date-fns'

import { generateDay } from './generator'
import { getSessions } from './sessions'

const DAY = new Date(2026, 9, 14) // Wednesday 14 October 2026

describe('generateDay', () => {
  it('is deterministic: the same day always gives the same sessions', () => {
    expect(generateDay('atelier-nord', DAY)).toEqual(generateDay('atelier-nord', DAY))
  })

  it('gives each site its own traffic', () => {
    const atelier = generateDay('atelier-nord', DAY)
    const fournil = generateDay('mie-celeste', DAY)
    expect(atelier.length).toBeGreaterThan(fournil.length * 2)
    expect(fournil.every((s) => !s.visitorId.startsWith('atelier-nord'))).toBe(true)
  })

  it('keeps every session internally consistent', () => {
    for (const session of generateDay('studio-brume', DAY)) {
      const { pageviews } = session
      const last = pageviews[pageviews.length - 1]!

      expect(pageviews.length).toBeGreaterThanOrEqual(1)
      expect(pageviews[0]!.viewedAt).toBe(session.startedAt)
      // Only the exit page has an unknown time on page.
      expect(last.timeOnPageS).toBeNull()
      expect(pageviews.slice(0, -1).every((p) => p.timeOnPageS !== null)).toBe(true)
      // Duration = sum of the known times on page (0 for a bounce).
      const sum = pageviews.reduce((total, p) => total + (p.timeOnPageS ?? 0), 0)
      expect(session.durationS).toBe(sum)
      // Pages are viewed in chronological order.
      expect(pageviews.every((p, i) => i === 0 || p.viewedAt > pageviews[i - 1]!.viewedAt)).toBe(
        true,
      )
      // Sessions start on the generated day.
      expect(new Date(session.startedAt).getDate()).toBe(DAY.getDate())
    }
  })

  it('ties the source to the channel', () => {
    const sessions = generateDay('atelier-nord', DAY)
    const ofChannel = (channel: string) => sessions.filter((s) => s.channel === channel)

    expect(ofChannel('direct').every((s) => s.referrer === null)).toBe(true)
    expect(ofChannel('email').every((s) => s.utm?.medium === 'email')).toBe(true)
    expect(ofChannel('organic').every((s) => /\.(com|org)$/.test(s.referrer ?? ''))).toBe(true)
  })

  it('never pairs a device with an impossible OS', () => {
    const sessions = getSessions('studio-brume', { start: DAY, end: addDays(DAY, 7) })
    const osOf = (device: string) =>
      new Set(sessions.filter((s) => s.device === device).map((s) => s.os))

    expect([...osOf('desktop')].sort()).toEqual(['Linux', 'Windows', 'macOS'])
    expect([...osOf('mobile')].sort()).toEqual(['Android', 'iOS'])
  })
})

describe('traffic patterns', () => {
  const weeks = { start: new Date(2026, 8, 7), end: new Date(2026, 10, 2) } // 8 full weeks

  function averagePerDay(siteId: string, weekdays: number[]) {
    const sessions = getSessions(siteId, weeks, new Date(2027, 0, 1))
    const days = new Set<string>()
    let count = 0
    for (const s of sessions) {
      const date = new Date(s.startedAt)
      if (weekdays.includes(date.getDay())) {
        count++
        days.add(date.toDateString())
      }
    }
    return count / days.size
  }

  it('drops on weekends for the design studio, rises for the bakery', () => {
    expect(averagePerDay('atelier-nord', [0, 6])).toBeLessThan(
      averagePerDay('atelier-nord', [1, 2, 3, 4, 5]) * 0.8,
    )
    expect(averagePerDay('mie-celeste', [0, 6])).toBeGreaterThan(
      averagePerDay('mie-celeste', [1, 2, 3, 4, 5]) * 1.2,
    )
  })

  it('has returning visitors: fewer unique visitors than sessions', () => {
    const sessions = getSessions('mie-celeste', weeks, new Date(2027, 0, 1))
    const visitors = new Set(sessions.map((s) => s.visitorId)).size
    expect(visitors).toBeLessThan(sessions.length * 0.85)
    expect(visitors).toBeGreaterThan(sessions.length * 0.4)
  })

  it('grows year over year', () => {
    const now = new Date(2027, 0, 1)
    const thisYear = getSessions('atelier-nord', weeks, now).length
    const lastYear = getSessions(
      'atelier-nord',
      { start: addDays(weeks.start, -364), end: addDays(weeks.end, -364) },
      now,
    ).length
    expect(thisYear).toBeGreaterThan(lastYear * 1.2)
  })
})

describe('getSessions', () => {
  it('returns only sessions inside the range', () => {
    const range = { start: new Date(2026, 9, 14, 9), end: new Date(2026, 9, 14, 12) }
    const sessions = getSessions('atelier-nord', range, new Date(2027, 0, 1))
    expect(sessions.length).toBeGreaterThan(0)
    expect(
      sessions.every(
        (s) => s.startedAt >= range.start.getTime() && s.startedAt < range.end.getTime(),
      ),
    ).toBe(true)
  })

  it('excludes sessions that have not happened yet', () => {
    const now = new Date(2026, 9, 14, 10, 30)
    const sessions = getSessions('atelier-nord', { start: DAY, end: addDays(DAY, 1) }, now)
    expect(sessions.every((s) => s.startedAt <= now.getTime())).toBe(true)
    expect(sessions.length).toBeLessThan(generateDay('atelier-nord', DAY).length)
  })

  it('returns a day identically whatever the requested range', () => {
    const now = new Date(2027, 0, 1)
    const oneDay = getSessions('atelier-nord', { start: DAY, end: addDays(DAY, 1) }, now)
    const month = getSessions(
      'atelier-nord',
      { start: addDays(DAY, -15), end: addDays(DAY, 15) },
      now,
    )
    const sameDay = month.filter(
      (s) =>
        new Date(s.startedAt).getDate() === DAY.getDate() &&
        new Date(s.startedAt).getMonth() === DAY.getMonth(),
    )
    expect(sameDay).toEqual(oneDay)
  })
})
