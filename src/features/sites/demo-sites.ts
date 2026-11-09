import type { Site } from './types'

/**
 * Demo workspace sites.
 * Temporary source of truth until the sites store (step 2) and Supabase (step 5).
 */
export const DEMO_SITES: readonly Site[] = [
  { id: 'atelier-nord', name: 'Atelier Nord', domain: 'atelier-nord.example' },
  { id: 'studio-brume', name: 'Studio Brume', domain: 'studio-brume.example' },
  { id: 'mie-celeste', name: 'La Mie Céleste', domain: 'mie-celeste.example' },
]

export function findSite(id: string): Site | undefined {
  return DEMO_SITES.find((site) => site.id === id)
}
