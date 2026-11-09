import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'

import DesignSystemView from './DesignSystemView.vue'

describe('DesignSystemView', () => {
  it('renders the product name', () => {
    const wrapper = mount(DesignSystemView)
    expect(wrapper.get('h1').text()).toBe('Atollo')
  })

  it('switches the theme from the radio group', async () => {
    const wrapper = mount(DesignSystemView)
    const dark = wrapper.findAll('[role="radio"]').find((b) => b.text() === 'Sombre')

    await dark?.trigger('click')

    expect(dark?.attributes('aria-checked')).toBe('true')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })
})
