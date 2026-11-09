import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import BaseButton from './BaseButton.vue'

describe('BaseButton', () => {
  it('is a non-submitting button by default', () => {
    const wrapper = mount(BaseButton, { slots: { default: 'Enregistrer' } })
    expect(wrapper.attributes('type')).toBe('button')
    expect(wrapper.text()).toBe('Enregistrer')
  })

  it('is disabled and busy while loading', () => {
    const wrapper = mount(BaseButton, { props: { loading: true } })
    expect(wrapper.attributes('disabled')).toBeDefined()
    expect(wrapper.attributes('aria-busy')).toBe('true')
  })
})
