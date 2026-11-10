import { SitesError, type SitesErrorCode } from './data'

const MESSAGES: Record<SitesErrorCode, string> = {
  'demo-readonly': 'Les sites du compte de démonstration ne peuvent pas être modifiés.',
  'domain-taken': 'Ce domaine est déjà suivi dans votre compte.',
  'not-found': 'Ce site n’existe plus. Rechargez la page.',
  unavailable: 'Le service est momentanément indisponible. Réessayez dans un instant.',
}

/** Message shown above a form when the request fails. */
export function sitesErrorMessage(error: unknown): string {
  return error instanceof SitesError ? MESSAGES[error.code] : MESSAGES.unavailable
}
