import { computed, shallowRef } from 'vue'
import { defineStore } from 'pinia'

import { authService, type SignInInput, type SignUpInput, type User } from './data'

/**
 * Who is signed in. The first truly global state of the app, hence Pinia:
 * the router guard, the sidebar and the settings all read it.
 * (Period, filters and sort stay in the URL: they describe a view, not the user.)
 */
export const useAuthStore = defineStore('auth', () => {
  const user = shallowRef<User | null>(null)
  let ready: Promise<void> | null = null

  /** Restores the session once; every later call returns the same promise. */
  function init() {
    ready ??= authService
      .getCurrentUser()
      .then((current) => {
        user.value = current
      })
      .catch(() => {
        user.value = null
      })
    return ready
  }

  async function signIn(input: SignInInput) {
    user.value = await authService.signIn(input)
  }

  async function signUp(input: SignUpInput) {
    user.value = await authService.signUp(input)
  }

  async function signInAsDemo() {
    user.value = await authService.signInAsDemo()
  }

  async function signOut() {
    await authService.signOut()
    user.value = null
  }

  return {
    user,
    isAuthenticated: computed(() => user.value !== null),
    init,
    signIn,
    signUp,
    signInAsDemo,
    signOut,
    requestPasswordReset: (email: string) => authService.requestPasswordReset(email),
  }
})
