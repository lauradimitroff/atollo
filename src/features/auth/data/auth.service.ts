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
  /** Current password asked again before a sensitive change, and it is wrong. */
  | 'wrong-password'
  /** The shared demo account cannot be modified. */
  | 'demo-readonly'
  /** No session any more (signed out in another tab, account deleted…). */
  | 'session-expired'
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

  // Account settings. Sensitive changes ask for the current password again: a session
  // left open on a shared computer must not be enough to take over the account.
  updateProfile(input: { name: string }): Promise<User>
  updateEmail(input: { email: string; currentPassword: string }): Promise<User>
  updatePassword(input: { currentPassword: string; newPassword: string }): Promise<void>
  /** Deletes the account and everything attached to it, then ends the session. */
  deleteAccount(input: { currentPassword: string }): Promise<void>
}
