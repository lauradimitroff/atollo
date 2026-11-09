import { createMockRepository } from './mock/mock.repository'
import type { AnalyticsRepository } from './repository'

/**
 * The single place that decides where statistics come from.
 * Step 5 or later: return a Supabase repository here, e.g. based on an env variable.
 */
export const analytics: AnalyticsRepository = createMockRepository()

export type { AnalyticsQuery, AnalyticsRepository } from './repository'
