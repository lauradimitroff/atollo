import type { Site } from './types'

/**
 * Demo workspace sites.
 * Fictional businesses on reserved `.example` domains (RFC 2606): they cannot belong
 * to anyone, so the demo never shows made-up statistics for a real website.
 * Temporary source of truth until sites are stored per user account.
 */
export const DEMO_SITES: readonly Site[] = [
  { id: 'atelier-nord', name: 'Atelier Nord', domain: 'atelier-nord.example' },
  { id: 'studio-brume', name: 'Studio Brume', domain: 'studio-brume.example' },
  { id: 'mie-celeste', name: 'La Mie Céleste', domain: 'mie-celeste.example' },
]

export function findSite(id: string): Site | undefined {
  return DEMO_SITES.find((site) => site.id === id)
}
