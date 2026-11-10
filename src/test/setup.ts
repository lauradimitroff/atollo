import { createPinia, setActivePinia } from 'pinia'
import { beforeEach } from 'vitest'

import { SESSION_KEY } from '@/features/auth/data/mock/mock-auth.service'

// Each test gets fresh stores and starts signed in to the demo account, as a visitor
// of the demo would be. Tests about signing in remove the session themselves.
beforeEach(() => {
  setActivePinia(createPinia())
  // Tests running in the Node environment have no browser storage.
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: 'demo' }))
  }
})
