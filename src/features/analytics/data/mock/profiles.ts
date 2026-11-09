/**
 * Traffic profile of each demo site. Three different businesses, three different
 * audiences: switching site visibly changes the numbers, sources and devices.
 */
import type { Weighted } from '@/shared/lib/random'
import type { Channel, Device, Utm } from '../../domain/types'
import type { HourCurve } from './catalog'

export interface PageProfile {
  path: string
  /** Popularity while browsing. */
  weight: number
  /** How often visitors land on it first (from Google, a social post…). */
  entryWeight: number
  /** Typical reading time, in seconds. */
  avgTimeS: number
}

export interface SiteProfile {
  /** Average sessions per weekday at the reference date (1 January 2026). */
  dailySessions: number
  /** Yearly growth: 0.35 = +35 % per year. */
  growthPerYear: number
  /** Weekend traffic relative to a weekday (a bakery is busier on Saturday). */
  weekendFactor: number
  /** Seasonal swing amplitude and the day of the year it peaks. */
  season: { amplitude: number; peakDayOfYear: number }
  hourCurve: HourCurve
  /** Share of sessions from a visitor who came before. */
  returningRate: number
  /** Size of the returning-visitor population. */
  visitorPool: number
  channels: Weighted<Channel>
  /** Probability that a session is a bounce, by channel. */
  bounceRate: Record<Channel, number>
  socialNetworks: Weighted<string>
  referrers: Weighted<string>
  campaigns: Weighted<Utm>
  devices: Weighted<Device>
  countries: Weighted<string>
  /** Optional city override for local businesses. */
  cities?: Partial<Record<string, Weighted<string>>>
  pages: readonly PageProfile[]
}

const BOUNCE: Record<Channel, number> = {
  direct: 0.42,
  organic: 0.52,
  social: 0.63,
  referral: 0.38,
  campaign: 0.56,
  email: 0.34,
}

export const PROFILES: Record<string, SiteProfile> = {
  // Design studio with a technical blog: organic search, office hours, desktop.
  'atelier-nord': {
    dailySessions: 340,
    growthPerYear: 0.38,
    weekendFactor: 0.62,
    season: { amplitude: 0.1, peakDayOfYear: 280 },
    hourCurve: 'office',
    returningRate: 0.32,
    visitorPool: 9000,
    channels: [
      ['organic', 42],
      ['direct', 25],
      ['social', 13],
      ['referral', 10],
      ['campaign', 5],
      ['email', 5],
    ],
    bounceRate: BOUNCE,
    socialNetworks: [
      ['linkedin.com', 48],
      ['instagram.com', 22],
      ['x.com', 14],
      ['bsky.app', 10],
      ['facebook.com', 6],
    ],
    referrers: [
      ['behance.net', 28],
      ['dribbble.com', 20],
      ['github.com', 16],
      ['awwwards.com', 14],
      ['medium.com', 12],
      ['malt.fr', 10],
    ],
    campaigns: [
      [{ source: 'google', medium: 'cpc', campaign: 'studio-design-lyon' }, 60],
      [{ source: 'linkedin', medium: 'paid-social', campaign: 'offre-identite' }, 40],
    ],
    devices: [
      ['desktop', 58],
      ['mobile', 37],
      ['tablet', 5],
    ],
    countries: [
      ['FR', 72],
      ['BE', 7],
      ['CH', 6],
      ['CA', 6],
      ['US', 3],
      ['DE', 2],
      ['GB', 2],
      ['ES', 2],
    ],
    pages: [
      { path: '/', weight: 30, entryWeight: 30, avgTimeS: 45 },
      { path: '/projets', weight: 18, entryWeight: 4, avgTimeS: 50 },
      { path: '/projets/identite-cafe-torrefacteur', weight: 9, entryWeight: 4, avgTimeS: 95 },
      { path: '/projets/refonte-boutique-en-ligne', weight: 7, entryWeight: 3, avgTimeS: 85 },
      { path: '/studio', weight: 9, entryWeight: 2, avgTimeS: 60 },
      { path: '/blog', weight: 10, entryWeight: 3, avgTimeS: 35 },
      { path: '/blog/design-tokens', weight: 9, entryWeight: 20, avgTimeS: 240 },
      { path: '/blog/vue-3-composables', weight: 7, entryWeight: 14, avgTimeS: 270 },
      { path: '/blog/typographie-variable', weight: 5, entryWeight: 9, avgTimeS: 210 },
      { path: '/blog/accessibilite-couleurs', weight: 5, entryWeight: 8, avgTimeS: 225 },
      { path: '/tarifs', weight: 8, entryWeight: 2, avgTimeS: 70 },
      { path: '/contact', weight: 7, entryWeight: 1, avgTimeS: 55 },
    ],
  },

  // Photographer: Instagram and Pinterest, evenings, mostly mobile, international.
  'studio-brume': {
    dailySessions: 170,
    growthPerYear: 0.22,
    weekendFactor: 1.15,
    season: { amplitude: 0.22, peakDayOfYear: 150 },
    hourCurve: 'evening',
    returningRate: 0.24,
    visitorPool: 6000,
    channels: [
      ['social', 38],
      ['organic', 26],
      ['direct', 18],
      ['referral', 10],
      ['campaign', 4],
      ['email', 4],
    ],
    bounceRate: BOUNCE,
    socialNetworks: [
      ['instagram.com', 56],
      ['pinterest.com', 28],
      ['facebook.com', 10],
      ['tiktok.com', 6],
    ],
    referrers: [
      ['mariages.net', 30],
      ['500px.com', 22],
      ['unsplash.com', 20],
      ['flickr.com', 14],
      ['vsco.co', 14],
    ],
    campaigns: [
      [{ source: 'instagram', medium: 'paid-social', campaign: 'saison-mariages' }, 70],
      [{ source: 'google', medium: 'cpc', campaign: 'photographe-mariage' }, 30],
    ],
    devices: [
      ['mobile', 62],
      ['desktop', 32],
      ['tablet', 6],
    ],
    countries: [
      ['FR', 45],
      ['US', 12],
      ['GB', 8],
      ['DE', 7],
      ['IT', 6],
      ['ES', 6],
      ['CA', 5],
      ['BE', 5],
      ['CH', 3],
      ['JP', 3],
    ],
    pages: [
      { path: '/', weight: 28, entryWeight: 34, avgTimeS: 40 },
      { path: '/portfolio', weight: 20, entryWeight: 8, avgTimeS: 75 },
      { path: '/portfolio/mariages', weight: 14, entryWeight: 14, avgTimeS: 120 },
      { path: '/portfolio/portraits', weight: 9, entryWeight: 8, avgTimeS: 95 },
      { path: '/portfolio/islande', weight: 8, entryWeight: 16, avgTimeS: 140 },
      { path: '/journal', weight: 6, entryWeight: 2, avgTimeS: 30 },
      { path: '/journal/lumiere-naturelle', weight: 5, entryWeight: 12, avgTimeS: 200 },
      { path: '/tarifs', weight: 9, entryWeight: 3, avgTimeS: 80 },
      { path: '/a-propos', weight: 6, entryWeight: 2, avgTimeS: 50 },
      { path: '/contact', weight: 6, entryWeight: 1, avgTimeS: 60 },
    ],
  },

  // Neighborhood bakery in Lyon: direct and Google Maps, early mornings, weekends, phones.
  'mie-celeste': {
    dailySessions: 80,
    growthPerYear: 0.15,
    weekendFactor: 1.4,
    season: { amplitude: 0.16, peakDayOfYear: 355 },
    hourCurve: 'morning',
    returningRate: 0.46,
    visitorPool: 2200,
    channels: [
      ['direct', 38],
      ['organic', 34],
      ['social', 14],
      ['referral', 8],
      ['email', 4],
      ['campaign', 2],
    ],
    bounceRate: BOUNCE,
    socialNetworks: [
      ['instagram.com', 60],
      ['facebook.com', 40],
    ],
    referrers: [
      ['maps.google.com', 55],
      ['tripadvisor.fr', 20],
      ['lafourchette.com', 15],
      ['guide-gourmand.example', 10],
    ],
    campaigns: [[{ source: 'facebook', medium: 'paid-social', campaign: 'galette-des-rois' }, 1]],
    devices: [
      ['mobile', 74],
      ['desktop', 20],
      ['tablet', 6],
    ],
    countries: [
      ['FR', 93],
      ['BE', 3],
      ['CH', 2],
      ['GB', 2],
    ],
    cities: {
      FR: [
        ['Lyon', 58],
        ['Villeurbanne', 16],
        ['Caluire-et-Cuire', 8],
        ['Paris', 9],
        ['Grenoble', 4],
        ['Saint-Étienne', 5],
      ],
    },
    pages: [
      { path: '/', weight: 30, entryWeight: 44, avgTimeS: 35 },
      { path: '/nos-pains', weight: 16, entryWeight: 8, avgTimeS: 55 },
      { path: '/patisseries', weight: 14, entryWeight: 8, avgTimeS: 60 },
      { path: '/commander', weight: 14, entryWeight: 12, avgTimeS: 110 },
      { path: '/commander/confirmation', weight: 6, entryWeight: 0, avgTimeS: 25 },
      { path: '/horaires', weight: 12, entryWeight: 18, avgTimeS: 20 },
      { path: '/actualites', weight: 4, entryWeight: 1, avgTimeS: 30 },
      { path: '/actualites/galette-des-rois', weight: 3, entryWeight: 7, avgTimeS: 90 },
      { path: '/contact', weight: 5, entryWeight: 2, avgTimeS: 40 },
    ],
  },
}

/** Sites created later by the user get a small, generic profile. */
export function profileFor(siteId: string): SiteProfile {
  return PROFILES[siteId] ?? { ...PROFILES['atelier-nord']!, dailySessions: 45 }
}
