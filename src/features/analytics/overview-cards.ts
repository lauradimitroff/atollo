/**
 * Content of the four overview cards: which data each tab loads and how rows are labeled.
 * Kept out of the view so OverviewView only does layout.
 */
import type { BreakdownItem, BreakdownTab } from './components/breakdown'
import { analytics, type AnalyticsQuery } from './data'
import { CHANNEL_LABELS, countryFlag, countryName, DEVICE_LABELS } from './domain/labels'
import type { BreakdownRow, Dimension } from './domain/metrics'
import type { Channel, Device } from './domain/types'

/** Breakdown rows → displayable items: visits and their share of the total. */
function byVisits(
  dimension: Dimension,
  present: (key: string) => Pick<BreakdownItem, 'label' | 'prefix' | 'mono'>,
) {
  return async (query: AnalyticsQuery): Promise<BreakdownItem[]> => {
    const rows: BreakdownRow[] = await analytics.getBreakdown(query, dimension)
    return rows.map((row) => ({
      key: row.key,
      value: row.visits,
      share: row.share,
      ...present(row.key),
    }))
  }
}

const asText = (key: string) => ({ label: key })
const asMono = (key: string) => ({ label: key, mono: true })

export const SOURCES_TABS: BreakdownTab[] = [
  {
    key: 'channels',
    label: 'Canaux',
    columnLabel: 'Canal',
    valueLabel: 'Visites',
    load: byVisits('channel', (key) => ({ label: CHANNEL_LABELS[key as Channel] ?? key })),
  },
  {
    key: 'referrers',
    label: 'Référents',
    columnLabel: 'Site',
    valueLabel: 'Visites',
    load: byVisits('referrer', asMono),
  },
  {
    key: 'campaigns',
    label: 'Campagnes',
    columnLabel: 'Campagne',
    valueLabel: 'Visites',
    load: byVisits('campaign', asMono),
  },
]

export const PAGES_TABS: BreakdownTab[] = [
  {
    key: 'top',
    label: 'Populaires',
    columnLabel: 'Page',
    valueLabel: 'Visiteurs',
    // Unique visitors per page: one visitor sees several pages, so no share here
    // (the percentages would add up to far more than 100 %).
    load: async (query) =>
      (await analytics.getPages(query)).map((page) => ({
        key: page.path,
        label: page.path,
        mono: true,
        value: page.visitors,
        share: null,
      })),
  },
  {
    key: 'entries',
    label: 'Entrées',
    columnLabel: 'Page d’entrée',
    valueLabel: 'Visites',
    load: byVisits('entryPage', asMono),
  },
  {
    key: 'exits',
    label: 'Sorties',
    columnLabel: 'Page de sortie',
    valueLabel: 'Visites',
    load: byVisits('exitPage', asMono),
  },
]

export const LOCATIONS_TABS: BreakdownTab[] = [
  {
    key: 'countries',
    label: 'Pays',
    columnLabel: 'Pays',
    valueLabel: 'Visites',
    load: byVisits('country', (code) => ({ label: countryName(code), prefix: countryFlag(code) })),
  },
  {
    key: 'cities',
    label: 'Villes',
    columnLabel: 'Ville',
    valueLabel: 'Visites',
    // City keys are "FR:Lyon", so two cities with the same name never merge.
    load: byVisits('city', (key) => {
      const [country = '', city = key] = key.split(':')
      return { label: city, prefix: countryFlag(country) }
    }),
  },
]

export const DEVICES_TABS: BreakdownTab[] = [
  {
    key: 'devices',
    label: 'Appareils',
    columnLabel: 'Appareil',
    valueLabel: 'Visites',
    load: byVisits('device', (key) => ({ label: DEVICE_LABELS[key as Device] ?? key })),
  },
  {
    key: 'browsers',
    label: 'Navigateurs',
    columnLabel: 'Navigateur',
    valueLabel: 'Visites',
    load: byVisits('browser', asText),
  },
  {
    key: 'os',
    label: 'Systèmes',
    columnLabel: 'Système',
    valueLabel: 'Visites',
    load: byVisits('os', asText),
  },
]
