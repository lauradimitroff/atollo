// @vitest-environment node
// Node's Web Crypto (crypto.subtle) is the one the browser exposes; jsdom has none.
import { beforeEach, describe, expect, it } from 'vitest'

import { AuthError } from '../auth.service'
import { ACCOUNTS_KEY, createMockAuthService, DEMO_USER } from './mock-auth.service'

function memoryStorage(): Storage {
  const data = new Map<string, string>()
  return {
    get length() {
      return data.size
    },
    clear: () => data.clear(),
    getItem: (key) => data.get(key) ?? null,
    key: (index) => [...data.keys()][index] ?? null,
    removeItem: (key) => void data.delete(key),
    setItem: (key, value) => void data.set(key, value),
  }
}

let storage: Storage
let auth: ReturnType<typeof createMockAuthService>
const LAURE = { name: 'Laure Test', email: 'laure@studio.example', password: 'correct horse' }

beforeEach(() => {
  storage = memoryStorage()
  auth = createMockAuthService({ storage, latency: 0 })
})

describe('mock auth service', () => {
  it('starts signed out', async () => {
    expect(await auth.getCurrentUser()).toBeNull()
  })

  it('signs up, keeps the session, signs out', async () => {
    const user = await auth.signUp(LAURE)
    expect(user).toMatchObject({ name: 'Laure Test', email: 'laure@studio.example', isDemo: false })
    expect(await auth.getCurrentUser()).toEqual(user)

    await auth.signOut()
    expect(await auth.getCurrentUser()).toBeNull()
  })

  it('never stores the password in clear', async () => {
    await auth.signUp(LAURE)
    const raw = storage.getItem(ACCOUNTS_KEY) ?? ''
    expect(raw).not.toContain(LAURE.password)
    expect(JSON.parse(raw)[0].passwordHash).toMatch(/^[0-9a-f]{64}$/)
  })

  it('signs in whatever the case and spaces of the e-mail', async () => {
    await auth.signUp(LAURE)
    await auth.signOut()
    const user = await auth.signIn({ email: '  Laure@Studio.example ', password: LAURE.password })
    expect(user.email).toBe('laure@studio.example')
  })

  it('gives the same error for an unknown e-mail and a wrong password', async () => {
    await auth.signUp(LAURE)
    const wrongPassword = auth.signIn({ email: LAURE.email, password: 'nope' })
    const unknownEmail = auth.signIn({ email: 'other@studio.example', password: 'nope' })
    await expect(wrongPassword).rejects.toEqual(new AuthError('invalid-credentials'))
    await expect(unknownEmail).rejects.toEqual(new AuthError('invalid-credentials'))
  })

  it('refuses an e-mail that already has an account', async () => {
    await auth.signUp(LAURE)
    await expect(auth.signUp({ ...LAURE, email: 'LAURE@studio.example' })).rejects.toEqual(
      new AuthError('email-taken'),
    )
    await expect(auth.signUp({ ...LAURE, email: DEMO_USER.email })).rejects.toEqual(
      new AuthError('email-taken'),
    )
  })

  it('opens the demo account without a password', async () => {
    expect(await auth.signInAsDemo()).toEqual(DEMO_USER)
    expect(await auth.getCurrentUser()).toEqual(DEMO_USER)
  })

  it('answers a reset request the same way for any e-mail', async () => {
    await expect(auth.requestPasswordReset('nobody@studio.example')).resolves.toBeUndefined()
  })
})
