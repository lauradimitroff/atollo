/**
 * The contract between the UI and whoever authenticates users.
 *
 * Today: a simulated service in the browser (mock/mock-auth.service.ts).
 * Later: Supabase, Firebase, Appwrite or an API of our own. Components and the store
 * only know this interface, so the provider can change without touching them.
 */

export interface User {
  id: string
  name: string
  email: string
  /** The shared demo account: fictional data, no password. */
  isDemo: boolean
}

export interface SignInInput {
  email: string
  password: string
}

export interface SignUpInput extends SignInInput {
  name: string
}

export type AuthErrorCode =
  /** Unknown e-mail or wrong password: never say which, it would reveal who has an account. */
  | 'invalid-credentials'
  | 'email-taken'
  /** Network down, provider unreachable, storage blocked… */
  | 'unavailable'

export class AuthError extends Error {
  constructor(readonly code: AuthErrorCode) {
    super(code)
    this.name = 'AuthError'
  }
}

export interface AuthService {
  /** The signed-in user, or null. Called once when the app starts. */
  getCurrentUser(): Promise<User | null>
  signIn(input: SignInInput): Promise<User>
  signUp(input: SignUpInput): Promise<User>
  signInAsDemo(): Promise<User>
  signOut(): Promise<void>
  /**
   * Sends a reset link if an account exists. Resolves in every case, so the answer
   * does not tell whether an e-mail address is registered.
   */
  requestPasswordReset(email: string): Promise<void>
}
