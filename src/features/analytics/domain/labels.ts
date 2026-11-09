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
