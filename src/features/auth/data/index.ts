import { createMockAuthService } from './mock/mock-auth.service'

/** The authentication provider used by the app: the only line to change for a real one. */
export const authService = createMockAuthService()

export * from './auth.service'
