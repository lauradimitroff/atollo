import { createMockSitesService } from './mock/mock-sites.service'

/** Where the sites of an account are stored: the only line to change for a real backend. */
export const sitesService = createMockSitesService()

export * from './sites.service'
