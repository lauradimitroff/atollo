import type { Site, SiteInput } from '../types'

export type SitesErrorCode = 'demo-readonly' | 'domain-taken' | 'not-found' | 'unavailable'

export class SitesError extends Error {
  constructor(readonly code: SitesErrorCode) {
    super(code)
    this.name = 'SitesError'
  }
}

/**
 * The contract between the UI and wherever the sites of an account are stored.
 *
 * Today: a mock in localStorage. Later: a `sites` table whose access rules (row level
 * security) only let an account read and write its own rows. The owner is passed
 * explicitly so the mock can apply the same rule.
 */
export interface SitesService {
  /** The sites of an account, oldest first. */
  list(ownerId: string): Promise<Site[]>
  create(ownerId: string, input: SiteInput): Promise<Site>
  update(ownerId: string, siteId: string, input: SiteInput): Promise<Site>
  remove(ownerId: string, siteId: string): Promise<void>
  /** Every site of a deleted account (a database would cascade the deletion). */
  removeAll(ownerId: string): Promise<void>
}
