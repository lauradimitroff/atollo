import { beforeEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import { THEME_STORAGE_KEY, useTheme } from './useTheme'

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('applies the dark class and persists the choice', async () => {
    const { preference, isDark } = useTheme()

    preference.value = 'dark'
    await nextTick()

    expect(isDark.value).toBe(true)
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
  })

  it('toggle switches between light and dark', async () => {
    const { preference, toggle, resolved } = useTheme()

    preference.value = 'light'
    toggle()
    await nextTick()
    expect(resolved.value).toBe('dark')

    toggle()
    await nextTick()
    expect(resolved.value).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})
