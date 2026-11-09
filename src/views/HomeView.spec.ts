import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'

import HomeView from './HomeView.vue'

describe('HomeView', () => {
  it('renders the product name', () => {
    const wrapper = mount(HomeView)
    expect(wrapper.get('h1').text()).toBe('Atollo')
  })

  it('switches the theme from the radio group', async () => {
    const wrapper = mount(HomeView)
    const dark = wrapper.findAll('[role="radio"]').find((b) => b.text() === 'Sombre')

    await dark?.trigger('click')

    expect(dark?.attributes('aria-checked')).toBe('true')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })
})
