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

// Design studio with a technical blog: organic search, office hours, desktop.
const ATELIER_NORD: SiteProfile = {
  dailySessions: 340,
  growthPerYear: 0.38,
  weekendFactor: 0.62,
  season: { amplitude: 0.1, peakDayOfYear: 280 },
  hourCurve: 'office',
  returningRate: 0.32,
  visitorPool: 2500,
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
}

export const PROFILES: Record<string, SiteProfile> = {
  'atelier-nord': ATELIER_NORD,

  // Photographer: Instagram and Pinterest, evenings, mostly mobile, international.
  'studio-brume': {
    dailySessions: 170,
    growthPerYear: 0.22,
    weekendFactor: 1.15,
    season: { amplitude: 0.22, peakDayOfYear: 150 },
    hourCurve: 'evening',
    returningRate: 0.24,
    visitorPool: 1800,
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
    visitorPool: 600,
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

  // Law firm in Bordeaux: small, steady, found through Google, read at the office.
  'ostrea-avocats': {
    dailySessions: 45,
    growthPerYear: 0.08,
    weekendFactor: 0.3,
    season: { amplitude: 0.08, peakDayOfYear: 270 },
    hourCurve: 'office',
    returningRate: 0.3,
    visitorPool: 500,
    channels: [
      ['organic', 55],
      ['direct', 28],
      ['referral', 10],
      ['social', 4],
      ['email', 2],
      ['campaign', 1],
    ],
    bounceRate: BOUNCE,
    socialNetworks: [
      ['linkedin.com', 85],
      ['facebook.com', 15],
    ],
    referrers: [
      ['annuaire-avocats.example', 60],
      ['guide-juridique.example', 40],
    ],
    campaigns: [[{ source: 'google', medium: 'cpc', campaign: 'avocat-droit-du-travail' }, 1]],
    devices: [
      ['desktop', 65],
      ['mobile', 32],
      ['tablet', 3],
    ],
    countries: [
      ['FR', 95],
      ['BE', 3],
      ['CH', 2],
    ],
    cities: {
      FR: [
        ['Bordeaux', 62],
        ['Mérignac', 12],
        ['Pessac', 9],
        ['Paris', 10],
        ['Toulouse', 7],
      ],
    },
    pages: [
      { path: '/', weight: 26, entryWeight: 30, avgTimeS: 40 },
      { path: '/expertises', weight: 16, entryWeight: 4, avgTimeS: 55 },
      { path: '/expertises/droit-du-travail', weight: 14, entryWeight: 20, avgTimeS: 150 },
      { path: '/expertises/droit-de-la-famille', weight: 11, entryWeight: 14, avgTimeS: 140 },
      { path: '/honoraires', weight: 12, entryWeight: 6, avgTimeS: 90 },
      { path: '/equipe', weight: 8, entryWeight: 2, avgTimeS: 45 },
      { path: '/actualites/rupture-conventionnelle', weight: 5, entryWeight: 18, avgTimeS: 260 },
      { path: '/contact', weight: 8, entryWeight: 6, avgTimeS: 60 },
    ],
  },

  // Electric bike shop: fast-growing e-commerce, spring peak, ads and newsletters.
  'velo-comete': {
    dailySessions: 220,
    growthPerYear: 0.45,
    weekendFactor: 1.1,
    season: { amplitude: 0.25, peakDayOfYear: 140 },
    hourCurve: 'evening',
    returningRate: 0.28,
    visitorPool: 1800,
    channels: [
      ['organic', 32],
      ['direct', 18],
      ['campaign', 18],
      ['social', 16],
      ['email', 9],
      ['referral', 7],
    ],
    bounceRate: BOUNCE,
    socialNetworks: [
      ['instagram.com', 45],
      ['facebook.com', 30],
      ['youtube.com', 25],
    ],
    referrers: [
      ['comparateur-velo.example', 55],
      ['forum-cyclo.example', 45],
    ],
    campaigns: [
      [{ source: 'google', medium: 'cpc', campaign: 'velos-electriques' }, 60],
      [{ source: 'meta', medium: 'paid-social', campaign: 'printemps-a-velo' }, 40],
    ],
    devices: [
      ['mobile', 60],
      ['desktop', 34],
      ['tablet', 6],
    ],
    countries: [
      ['FR', 82],
      ['BE', 9],
      ['CH', 6],
      ['CA', 3],
    ],
    pages: [
      { path: '/', weight: 24, entryWeight: 30, avgTimeS: 35 },
      { path: '/velos-electriques', weight: 20, entryWeight: 20, avgTimeS: 70 },
      { path: '/velos-electriques/comete-e2', weight: 14, entryWeight: 16, avgTimeS: 130 },
      { path: '/accessoires', weight: 10, entryWeight: 6, avgTimeS: 55 },
      { path: '/atelier-reparation', weight: 8, entryWeight: 8, avgTimeS: 60 },
      { path: '/panier', weight: 10, entryWeight: 1, avgTimeS: 45 },
      { path: '/commande/confirmation', weight: 4, entryWeight: 0, avgTimeS: 20 },
      { path: '/blog/entretenir-sa-chaine', weight: 4, entryWeight: 12, avgTimeS: 200 },
    ],
  },

  // Plant nursery: strongly seasonal (spring planting), Pinterest and newsletters.
  'jardins-sorbe': {
    dailySessions: 120,
    growthPerYear: 0.2,
    weekendFactor: 1.3,
    season: { amplitude: 0.4, peakDayOfYear: 105 },
    hourCurve: 'evening',
    returningRate: 0.35,
    visitorPool: 1200,
    channels: [
      ['organic', 40],
      ['direct', 22],
      ['social', 18],
      ['email', 12],
      ['referral', 6],
      ['campaign', 2],
    ],
    bounceRate: BOUNCE,
    socialNetworks: [
      ['pinterest.com', 60],
      ['instagram.com', 30],
      ['facebook.com', 10],
    ],
    referrers: [
      ['blog-potager.example', 60],
      ['annuaire-pepinieres.example', 40],
    ],
    campaigns: [[{ source: 'google', medium: 'cpc', campaign: 'plantes-vivaces' }, 1]],
    devices: [
      ['mobile', 55],
      ['desktop', 38],
      ['tablet', 7],
    ],
    countries: [
      ['FR', 90],
      ['BE', 5],
      ['CH', 5],
    ],
    pages: [
      { path: '/', weight: 22, entryWeight: 26, avgTimeS: 40 },
      { path: '/vivaces', weight: 16, entryWeight: 12, avgTimeS: 80 },
      { path: '/arbustes', weight: 12, entryWeight: 8, avgTimeS: 75 },
      { path: '/arbres-fruitiers', weight: 12, entryWeight: 10, avgTimeS: 85 },
      { path: '/conseils/planter-a-l-automne', weight: 8, entryWeight: 18, avgTimeS: 210 },
      { path: '/conseils/tailler-les-rosiers', weight: 8, entryWeight: 16, avgTimeS: 190 },
      { path: '/panier', weight: 8, entryWeight: 1, avgTimeS: 40 },
      { path: '/contact', weight: 4, entryWeight: 2, avgTimeS: 45 },
    ],
  },

  // Yoga studio in Nantes: regulars on their phone, Instagram, January resolutions.
  'yoga-lumen': {
    dailySessions: 60,
    growthPerYear: 0.3,
    weekendFactor: 0.9,
    season: { amplitude: 0.15, peakDayOfYear: 15 },
    hourCurve: 'evening',
    returningRate: 0.52,
    visitorPool: 400,
    channels: [
      ['social', 40],
      ['direct', 28],
      ['organic', 22],
      ['email', 8],
      ['referral', 1],
      ['campaign', 1],
    ],
    bounceRate: BOUNCE,
    socialNetworks: [
      ['instagram.com', 80],
      ['facebook.com', 20],
    ],
    referrers: [['agenda-bien-etre.example', 1]],
    campaigns: [[{ source: 'instagram', medium: 'paid-social', campaign: 'stage-printemps' }, 1]],
    devices: [
      ['mobile', 78],
      ['desktop', 18],
      ['tablet', 4],
    ],
    countries: [
      ['FR', 97],
      ['BE', 3],
    ],
    cities: {
      FR: [
        ['Nantes', 70],
        ['Rezé', 12],
        ['Saint-Herblain', 10],
        ['Paris', 8],
      ],
    },
    pages: [
      { path: '/', weight: 22, entryWeight: 34, avgTimeS: 30 },
      { path: '/planning', weight: 24, entryWeight: 22, avgTimeS: 50 },
      { path: '/cours/vinyasa', weight: 10, entryWeight: 8, avgTimeS: 70 },
      { path: '/cours/yin', weight: 8, entryWeight: 6, avgTimeS: 70 },
      { path: '/tarifs', weight: 14, entryWeight: 6, avgTimeS: 60 },
      { path: '/reserver', weight: 16, entryWeight: 14, avgTimeS: 80 },
      { path: '/stage-printemps', weight: 6, entryWeight: 10, avgTimeS: 110 },
    ],
  },

  // Just added: the tracking script is not installed yet, so no visit at all.
  'maison-tilleul': {
    ...ATELIER_NORD,
    dailySessions: 0,
  },
}

/** Sites created later by the user get a small, generic profile. */
export function profileFor(siteId: string): SiteProfile {
  return PROFILES[siteId] ?? { ...ATELIER_NORD, dailySessions: 45 }
}
