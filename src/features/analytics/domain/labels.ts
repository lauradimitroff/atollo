import type { Channel, Device } from './types'

/** Display names, kept out of the components so tables, charts and filters agree. */
export const CHANNEL_LABELS: Record<Channel, string> = {
  organic: 'Recherche organique',
  direct: 'Direct',
  social: 'Réseaux sociaux',
  referral: 'Sites référents',
  campaign: 'Campagnes',
  email: 'E-mail',
}

export const DEVICE_LABELS: Record<Device, string> = {
  desktop: 'Ordinateur',
  mobile: 'Mobile',
  tablet: 'Tablette',
}

const regionNames = new Intl.DisplayNames('fr-FR', { type: 'region' })

/** "FR" → "France". Falls back to the code for anything unknown. */
export function countryName(code: string): string {
  try {
    return regionNames.of(code) ?? code
  } catch {
    return code
  }
}

/**
 * "FR" → 🇫🇷: a flag emoji is two "regional indicator" letters.
 * No image to load; Windows shows the two letters instead, which stays readable.
 */
export function countryFlag(code: string): string {
  if (!/^[A-Z]{2}$/.test(code)) return ''
  return String.fromCodePoint(...[...code].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65))
}
