/**
 * Shared reference data for the generator: cities, browsers, sources.
 * Site-specific behavior lives in profiles.ts.
 */
import type { Weighted } from '@/shared/lib/random'
import type { Device, Utm } from '../../domain/types'

export const CITIES: Record<string, Weighted<string>> = {
  FR: [
    ['Paris', 34],
    ['Lyon', 11],
    ['Marseille', 8],
    ['Toulouse', 7],
    ['Bordeaux', 7],
    ['Nantes', 7],
    ['Lille', 6],
    ['Rennes', 5],
    ['Strasbourg', 5],
    ['Montpellier', 5],
    ['Grenoble', 5],
  ],
  BE: [
    ['Bruxelles', 55],
    ['Liège', 20],
    ['Namur', 13],
    ['Gand', 12],
  ],
  CH: [
    ['Genève', 45],
    ['Lausanne', 35],
    ['Zurich', 20],
  ],
  CA: [
    ['Montréal', 65],
    ['Québec', 20],
    ['Toronto', 15],
  ],
  US: [
    ['New York', 35],
    ['San Francisco', 25],
    ['Los Angeles', 20],
    ['Chicago', 20],
  ],
  GB: [
    ['Londres', 70],
    ['Manchester', 15],
    ['Édimbourg', 15],
  ],
  DE: [
    ['Berlin', 45],
    ['Munich', 30],
    ['Hambourg', 25],
  ],
  ES: [
    ['Madrid', 50],
    ['Barcelone', 50],
  ],
  IT: [
    ['Milan', 50],
    ['Rome', 35],
    ['Turin', 15],
  ],
  NL: [
    ['Amsterdam', 70],
    ['Rotterdam', 30],
  ],
  JP: [
    ['Tokyo', 75],
    ['Osaka', 25],
  ],
}

/** Browser and OS depend on the device: no Safari on Android, no iOS on desktop. */
export const TECH: Record<Device, { browsers: Weighted<string>; os: Weighted<string> }> = {
  desktop: {
    browsers: [
      ['Chrome', 58],
      ['Safari', 18],
      ['Firefox', 10],
      ['Edge', 12],
      ['Arc', 2],
    ],
    os: [
      ['Windows', 56],
      ['macOS', 38],
      ['Linux', 6],
    ],
  },
  mobile: {
    browsers: [
      ['Safari', 52],
      ['Chrome', 40],
      ['Samsung Internet', 6],
      ['Firefox', 2],
    ],
    os: [
      ['iOS', 56],
      ['Android', 44],
    ],
  },
  tablet: {
    browsers: [
      ['Safari', 68],
      ['Chrome', 32],
    ],
    os: [
      ['iPadOS', 70],
      ['Android', 30],
    ],
  },
}

export const SEARCH_ENGINES: Weighted<string> = [
  ['google.com', 86],
  ['bing.com', 6],
  ['duckduckgo.com', 4],
  ['ecosia.org', 2],
  ['qwant.com', 2],
]

export const NEWSLETTER: Utm = {
  source: 'newsletter',
  medium: 'email',
  campaign: 'lettre-mensuelle',
}

/** Relative traffic per hour of day (0 → 23), by audience habit. */
export const HOUR_CURVES = {
  /** Professional audience: office hours. */
  office: [1, 1, 1, 1, 1, 2, 3, 6, 9, 12, 13, 12, 9, 10, 12, 12, 11, 9, 7, 6, 6, 5, 3, 2],
  /** Leisure audience: lunch break and evenings. */
  evening: [3, 2, 1, 1, 1, 1, 2, 4, 5, 6, 7, 8, 10, 9, 7, 7, 8, 9, 10, 12, 14, 14, 10, 6],
  /** Local shop: early morning orders. */
  morning: [1, 1, 1, 1, 2, 5, 11, 15, 14, 11, 9, 9, 10, 7, 5, 5, 6, 7, 7, 6, 5, 4, 3, 2],
} as const satisfies Record<string, readonly number[]>

export type HourCurve = keyof typeof HOUR_CURVES
