import { z } from 'zod'

/**
 * Accepts what people paste from their address bar and keeps the bare domain:
 * "https://www.Mon-Site.fr/blog?x=1" → "mon-site.fr". The www is dropped because
 * it is the same site for its visitors.
 */
export function normalizeDomain(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^[a-z][a-z0-9+.-]*:\/\//, '')
    .replace(/[/?#:].*$/, '')
    .replace(/^www\./, '')
    .replace(/\.$/, '')
}

// Labels of letters, digits and inner hyphens, then a top-level domain
// (letters, or "xn--…" for internationalized ones).
const DOMAIN = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z][a-z0-9-]{1,62}$/

export const siteSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: 'Donnez un nom au site.' })
    .max(60, { error: '60 caractères maximum.' }),
  domain: z
    .string()
    .transform(normalizeDomain)
    .pipe(
      z
        .string()
        .min(1, { error: 'Indiquez le domaine du site.' })
        .regex(DOMAIN, { error: 'Ce domaine n’est pas valide, par exemple : monsite.fr' }),
    ),
})
