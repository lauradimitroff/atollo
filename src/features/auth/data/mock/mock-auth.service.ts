import { AuthError, type AuthService, type User } from '../auth.service'

/**
 * Simulated authentication, entirely in the browser: accounts and the session live in
 * localStorage. Enough to build and test every screen (latency, errors, redirects)
 * before choosing a real provider.
 *
 * Passwords are never stored in clear, even here: a random salt + SHA-256. A real
 * backend would use a slow hash made for passwords (Argon2, bcrypt) on the server.
 */

interface StoredAccount {
  id: string
  name: string
  email: string
  salt: string
  passwordHash: string
}

interface StoredSession {
  userId: string
}

export const ACCOUNTS_KEY = 'atollo-accounts'
export const SESSION_KEY = 'atollo-session'

export const DEMO_USER: User = {
  id: 'demo',
  name: 'Compte démo',
  email: 'demo@atollo.example',
  isDemo: true,
}

export interface MockAuthOptions {
  storage?: Storage
  /** Simulated network latency, in ms. */
  latency?: number
}

const normalizeEmail = (email: string) => email.trim().toLowerCase()

const toHex = (bytes: ArrayBuffer | Uint8Array) =>
  [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, '0')).join('')

async function hashPassword(password: string, salt: string) {
  const data = new TextEncoder().encode(`${salt}:${password}`)
  return toHex(await crypto.subtle.digest('SHA-256', data))
}

export function createMockAuthService({
  storage = localStorage,
  latency = 450,
}: MockAuthOptions = {}): AuthService {
  const delay = () => new Promise((resolve) => setTimeout(resolve, latency))

  // Storage can throw (private mode, quota, blocked site data): report it as unavailable.
  function read<T>(key: string, fallback: T): T {
    try {
      const raw = storage.getItem(key)
      return raw ? (JSON.parse(raw) as T) : fallback
    } catch {
      return fallback
    }
  }
  function write(key: string, value: unknown) {
    try {
      if (value === null) storage.removeItem(key)
      else storage.setItem(key, JSON.stringify(value))
    } catch {
      throw new AuthError('unavailable')
    }
  }

  const accounts = () => read<StoredAccount[]>(ACCOUNTS_KEY, [])
  const toUser = ({ id, name, email }: StoredAccount): User => ({ id, name, email, isDemo: false })
  const startSession = (user: User) => {
    write(SESSION_KEY, { userId: user.id } satisfies StoredSession)
    return user
  }

  return {
    async getCurrentUser() {
      const session = read<StoredSession | null>(SESSION_KEY, null)
      if (!session) return null
      if (session.userId === DEMO_USER.id) return DEMO_USER
      const account = accounts().find((a) => a.id === session.userId)
      if (!account) {
        write(SESSION_KEY, null) // session of a deleted account
        return null
      }
      return toUser(account)
    },

    async signIn({ email, password }) {
      await delay()
      const account = accounts().find((a) => a.email === normalizeEmail(email))
      // Same error, and the same work, whether the e-mail exists or not.
      const hash = await hashPassword(password, account?.salt ?? 'no-account')
      if (!account || hash !== account.passwordHash) throw new AuthError('invalid-credentials')
      return startSession(toUser(account))
    },

    async signUp({ name, email, password }) {
      await delay()
      const all = accounts()
      const normalized = normalizeEmail(email)
      if (normalized === DEMO_USER.email || all.some((a) => a.email === normalized)) {
        throw new AuthError('email-taken')
      }
      const salt = toHex(crypto.getRandomValues(new Uint8Array(16)))
      const account: StoredAccount = {
        id: crypto.randomUUID(),
        name: name.trim(),
        email: normalized,
        salt,
        passwordHash: await hashPassword(password, salt),
      }
      write(ACCOUNTS_KEY, [...all, account])
      return startSession(toUser(account))
    },

    async signInAsDemo() {
      await delay()
      return startSession(DEMO_USER)
    },

    async signOut() {
      write(SESSION_KEY, null)
    },

    async requestPasswordReset() {
      // Nothing is sent in the demo; a real provider would e-mail a single-use link.
      await delay()
    },
  }
}
