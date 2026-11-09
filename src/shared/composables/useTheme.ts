import { computed } from 'vue'
import { createSharedComposable, useColorMode } from '@vueuse/core'

export type ThemePreference = 'light' | 'dark' | 'auto'

/** Key shared with the inline script in index.html that prevents a flash of the wrong theme. */
export const THEME_STORAGE_KEY = 'atollo-theme'

/**
 * Theme preference (light / dark / follow the system).
 *
 * VueUse's `useColorMode` persists the choice in localStorage, listens to the OS
 * setting and toggles the `.dark` class on <html>. `createSharedComposable`
 * makes every component share one instance instead of each adding its own listeners.
 */
export const useTheme = createSharedComposable(() => {
  const mode = useColorMode({
    attribute: 'class',
    storageKey: THEME_STORAGE_KEY,
    initialValue: 'auto',
    disableTransition: true,
  })

  /** What the user picked, including "auto". */
  const preference = computed<ThemePreference>({
    get: () => mode.store.value,
    set: (value) => {
      mode.store.value = value
    },
  })

  /** The theme actually displayed ("auto" resolved against the OS). */
  const resolved = computed<'light' | 'dark'>(() =>
    mode.state.value === 'dark' ? 'dark' : 'light',
  )
  const isDark = computed(() => resolved.value === 'dark')

  function toggle() {
    preference.value = isDark.value ? 'light' : 'dark'
  }

  return { preference, resolved, isDark, toggle }
})
