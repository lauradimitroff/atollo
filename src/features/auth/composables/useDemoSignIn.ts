import { ref } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import { useRouter } from 'vue-router'

import { useAuthStore } from '../auth.store'
import { authErrorMessage } from '../messages'

/**
 * "Explorer la démo": opens the shared demo account, then the app.
 * Used by the landing page and the sign-in page.
 */
export function useDemoSignIn({
  destination = () => ({ name: 'sites' }),
  replace = false,
}: {
  destination?: () => RouteLocationRaw
  /** From the sign-in page: the back button should not lead back to it. */
  replace?: boolean
} = {}) {
  const auth = useAuthStore()
  const router = useRouter()
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function openDemo() {
    loading.value = true
    error.value = null
    try {
      await auth.signInAsDemo()
      await (replace ? router.replace(destination()) : router.push(destination()))
    } catch (failure) {
      error.value = authErrorMessage(failure)
    } finally {
      loading.value = false
    }
  }

  return { openDemo, loading, error }
}
