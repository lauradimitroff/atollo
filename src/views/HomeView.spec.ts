import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'

import HomeView from './HomeView.vue'

describe('HomeView', () => {
  it('renders the product name', () => {
    const wrapper = mount(HomeView)
    expect(wrapper.get('h1').text()).toBe('Atollo')
  })
})
