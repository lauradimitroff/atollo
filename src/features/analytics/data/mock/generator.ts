/**
 * Demo traffic generator.
 *
 * Generates realistic raw sessions one day at a time. Each day has its own seed
 * ("atelier-nord:2026-11-09"), so a day's traffic never depends on which period is
 * displayed: the 9 November figures are identical in "7 days", "30 days" or a
 * custom range. That is what makes the period comparisons consistent.
 */
import { differenceInCalendarDays, getDay, getDayOfYear } from 'date-fns'

import { createRandom, hashString, type Random, type Weighted } from '@/shared/lib/random'
import { toDayString } from '../../domain/period'
import type { Channel, Pageview, Session, Utm } from '../../domain/types'
import { CITIES, HOUR_CURVES, NEWSLETTER, SEARCH_ENGINES, TECH } from './catalog'
import { profileFor, type PageProfile, type SiteProfile } from './profiles'

/** Traffic volumes in the profiles are expressed at this date; growth is relative to it. */
const REFERENCE_DATE = new Date(2026, 0, 1)

const MAX_PAGES_PER_SESSION = 12

/** Weighted lists derived from a profile, built once per profile. */
interface Prepared {
  hours: Weighted<number>
  entryPages: Weighted<SiteProfile['pages'][number]>
  browsePages: Weighted<SiteProfile['pages'][number]>
}
const prepared = new WeakMap<SiteProfile, Prepared>()

function prepare(profile: SiteProfile): Prepared {
  let result = prepared.get(profile)
  if (!result) {
    result = {
      hours: HOUR_CURVES[profile.hourCurve].map((weight, hour) => [hour, weight] as const),
      entryPages: profile.pages.map((page) => [page, page.entryWeight] as const),
      browsePages: profile.pages.map((page) => [page, page.weight] as const),
    }
    prepared.set(profile, result)
  }
  return result
}

/** Expected number of sessions on a given day, before the per-session details. */
function dailyVolume(profile: SiteProfile, day: Date, random: Random, isCampaignDay: boolean) {
  const years = differenceInCalendarDays(day, REFERENCE_DATE) / 365
  const growth = (1 + profile.growthPerYear) ** years
  const weekday = getDay(day)
  const weekend = weekday === 0 || weekday === 6 ? profile.weekendFactor : 1
  const { amplitude, peakDayOfYear } = profile.season
  const season = 1 + amplitude * Math.cos((2 * Math.PI * (getDayOfYear(day) - peakDayOfYear)) / 365)
  const noise = Math.max(0.75, random.normal(1, 0.08))
  const spike = isCampaignDay ? 1.5 + random.next() * 0.6 : 1
  return Math.round(profile.dailySessions * growth * weekend * season * noise * spike)
}

function sourceFor(
  channel: Channel,
  profile: SiteProfile,
  random: Random,
  campaign: Utm | null,
): { referrer: string | null; utm: Utm | null } {
  switch (channel) {
    case 'direct':
      return { referrer: null, utm: null }
    case 'organic':
      return { referrer: random.weighted(SEARCH_ENGINES), utm: null }
    case 'social':
      return { referrer: random.weighted(profile.socialNetworks), utm: null }
    case 'referral':
      return { referrer: random.weighted(profile.referrers), utm: null }
    case 'email':
      // Mail clients send no referrer: only the UTM tags tell where the visit comes from.
      return { referrer: null, utm: NEWSLETTER }
    case 'campaign': {
      const utm = campaign ?? random.weighted(profile.campaigns)
      return { referrer: `${utm.source}.com`, utm }
    }
  }
}

/**
 * Chance of viewing another page after this one. Visitors read an article and leave,
 * but go on from a home page: exit rates differ from page to page, as in real life.
 */
const CONTINUE = { rare: 0.65, normal: 0.45, often: 0.16 } as const

function browse(
  profile: SiteProfile,
  random: Random,
  startedAt: number,
  bounce: boolean,
): { pageviews: Pageview[]; durationS: number } {
  const { entryPages, browsePages } = prepare(profile)

  // Pick the next page, avoiding an immediate reload of the same one.
  const nextAfter = (current: PageProfile) => {
    const next = random.weighted(browsePages)
    return next.path === current.path ? random.weighted(browsePages) : next
  }

  const visited = [random.weighted(entryPages)]
  if (!bounce) {
    visited.push(nextAfter(visited[0]!))
    while (
      visited.length < MAX_PAGES_PER_SESSION &&
      random.chance(CONTINUE[visited[visited.length - 1]!.exit ?? 'normal'])
    ) {
      visited.push(nextAfter(visited[visited.length - 1]!))
    }
  }

  const pageviews: Pageview[] = []
  let time = startedAt
  let durationS = 0

  visited.forEach((page, i) => {
    const isLast = i === visited.length - 1
    const timeOnPageS = isLast
      ? null
      : Math.max(4, Math.round(random.normal(page.avgTimeS, page.avgTimeS * 0.4)))
    pageviews.push({ path: page.path, viewedAt: time, timeOnPageS })
    if (timeOnPageS !== null) {
      time += timeOnPageS * 1000
      durationS += timeOnPageS
    }
  })

  return { pageviews, durationS }
}

/** All sessions of one site on one local calendar day, sorted by start time. */
export function generateDay(siteId: string, day: Date): Session[] {
  const profile = profileFor(siteId)
  const dayKey = toDayString(day)
  const random = createRandom(hashString(`${siteId}:${dayKey}`))
  const { hours } = prepare(profile)

  // About one day in 25 a campaign runs: more traffic, much of it from that campaign.
  const campaign = random.chance(0.04) ? random.weighted(profile.campaigns) : null
  const count = dailyVolume(profile, day, random, campaign !== null)

  const sessions: Session[] = []
  for (let i = 0; i < count; i++) {
    const startedAt = new Date(
      day.getFullYear(),
      day.getMonth(),
      day.getDate(),
      random.weighted(hours),
      random.int(0, 59),
      random.int(0, 59),
    ).getTime()

    const channel: Channel =
      campaign && random.chance(0.4) ? 'campaign' : random.weighted(profile.channels)
    const device = random.weighted(profile.devices)
    const country = random.weighted(profile.countries)
    const cities = profile.cities?.[country] ?? CITIES[country] ?? [['Inconnue', 1] as const]

    const bounceProbability = profile.bounceRate[channel] + (device === 'mobile' ? 0.06 : 0)
    const { pageviews, durationS } = browse(
      profile,
      random,
      startedAt,
      random.chance(bounceProbability),
    )

    sessions.push({
      id: `${dayKey}-${i}`,
      visitorId: random.chance(profile.returningRate)
        ? `${siteId}-v${random.int(0, profile.visitorPool - 1)}`
        : `${siteId}-${dayKey}-${i}`,
      startedAt,
      durationS,
      channel,
      ...sourceFor(channel, profile, random, campaign),
      country,
      city: random.weighted(cities),
      device,
      browser: random.weighted(TECH[device].browsers),
      os: random.weighted(TECH[device].os),
      pageviews,
    })
  }

  return sessions.sort((a, b) => a.startedAt - b.startedAt)
}
