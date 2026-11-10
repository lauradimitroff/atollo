import { AuthError, type AuthErrorCode } from './data'

const MESSAGES: Record<AuthErrorCode, string> = {
  'invalid-credentials': 'E-mail ou mot de passe incorrect.',
  'email-taken': 'Un compte existe déjà avec cette adresse e-mail.',
  'wrong-password': 'Mot de passe actuel incorrect.',
  'demo-readonly': 'Le compte de démonstration ne peut pas être modifié.',
  'session-expired': 'Votre session a expiré. Reconnectez-vous pour continuer.',
  unavailable: 'Le service est momentanément indisponible. Réessayez dans un instant.',
}

/** Message shown above a form when the request fails. */
export function authErrorMessage(error: unknown): string {
  return error instanceof AuthError ? MESSAGES[error.code] : MESSAGES.unavailable
}
