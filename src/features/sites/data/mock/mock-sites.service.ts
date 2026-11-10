import { DEMO_USER } from '@/features/auth/data/mock/mock-auth.service'
import { DEMO_SITES } from '../../demo-sites'
import type { Site, SiteInput } from '../../types'
import { SitesError, type SitesService } from '../sites.service'

/**
 * Simulated storage of the sites, in localStorage, shaped like the future table:
 * one row per site with its owner. The demo account always gets the demo sites,
 * read-only: it is shared by every visitor.
 */

interface StoredSite extends Site {
  ownerId: string
}

export const SITES_KEY = 'atollo-sites'

export interface MockSitesOptions {
  storage?: Storage
  /** Simulated network latency, in ms. */
  latency?: number
}

const ID_ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789'

/** Short random id, readable in a URL: /s/k3v9x2m7qa/overview. */
function newSiteId() {
  const bytes = crypto.getRandomValues(new Uint8Array(10))
  return [...bytes].map((b) => ID_ALPHABET[b % ID_ALPHABET.length]).join('')
}

const toSite = ({ id, name, domain }: StoredSite): Site => ({ id, name, domain })

export function createMockSitesService({
  storage = localStorage,
  latency = 300,
}: MockSitesOptions = {}): SitesService {
  const delay = () => new Promise((resolve) => setTimeout(resolve, latency))

  function rows(): StoredSite[] {
    try {
      const raw = storage.getItem(SITES_KEY)
      return raw ? (JSON.parse(raw) as StoredSite[]) : []
    } catch {
      return []
    }
  }
  function save(next: StoredSite[]) {
    try {
      storage.setItem(SITES_KEY, JSON.stringify(next))
    } catch {
      throw new SitesError('unavailable')
    }
  }

  const isDemo = (ownerId: string) => ownerId === DEMO_USER.id
  function assertWritable(ownerId: string) {
    if (isDemo(ownerId)) throw new SitesError('demo-readonly')
  }

  /** A domain is tracked once per account: two sites with the same domain would mix up. */
  function assertDomainFree(ownerId: string, domain: string, exceptId?: string) {
    const taken = rows().some(
      (row) => row.ownerId === ownerId && row.domain === domain && row.id !== exceptId,
    )
    if (taken) throw new SitesError('domain-taken')
  }

  return {
    async list(ownerId) {
      await delay()
      if (isDemo(ownerId)) return [...DEMO_SITES]
      return rows()
        .filter((row) => row.ownerId === ownerId)
        .map(toSite)
    },

    async create(ownerId, input: SiteInput) {
      await delay()
      assertWritable(ownerId)
      assertDomainFree(ownerId, input.domain)
      const row: StoredSite = { id: newSiteId(), ownerId, name: input.name, domain: input.domain }
      save([...rows(), row])
      return toSite(row)
    },

    async update(ownerId, siteId, input) {
      await delay()
      assertWritable(ownerId)
      const all = rows()
      const current = all.find((row) => row.id === siteId && row.ownerId === ownerId)
      if (!current) throw new SitesError('not-found')
      assertDomainFree(ownerId, input.domain, siteId)
      const updated: StoredSite = { ...current, name: input.name, domain: input.domain }
      save(all.map((row) => (row === current ? updated : row)))
      return toSite(updated)
    },

    async remove(ownerId, siteId) {
      await delay()
      assertWritable(ownerId)
      const all = rows()
      if (!all.some((row) => row.id === siteId && row.ownerId === ownerId)) {
        throw new SitesError('not-found')
      }
      save(all.filter((row) => row.id !== siteId))
    },

    async removeAll(ownerId) {
      await delay()
      assertWritable(ownerId)
      save(rows().filter((row) => row.ownerId !== ownerId))
    },
  }
}
