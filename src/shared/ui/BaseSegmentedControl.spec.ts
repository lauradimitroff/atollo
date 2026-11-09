import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import BaseSegmentedControl from './BaseSegmentedControl.vue'

const options = [
  { value: '7d', label: '7 j' },
  { value: '30d', label: '30 j' },
] as const

describe('BaseSegmentedControl', () => {
  it('marks the current value as checked', () => {
    const wrapper = mount(BaseSegmentedControl, {
      props: { options, modelValue: '30d', label: 'Période' },
    })
    const radios = wrapper.findAll('[role="radio"]')

    expect(wrapper.get('[role="radiogroup"]').attributes('aria-label')).toBe('Période')
    expect(radios[0]?.attributes('aria-checked')).toBe('false')
    expect(radios[1]?.attributes('aria-checked')).toBe('true')
  })

  it('emits the new value on click', async () => {
    const wrapper = mount(BaseSegmentedControl, {
      props: { options, modelValue: '30d', label: 'Période' },
    })

    await wrapper.findAll('[role="radio"]')[0]?.trigger('click')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['7d'])
  })
})
