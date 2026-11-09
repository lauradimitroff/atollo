import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import { mount } from '@vue/test-utils'

import BaseField from './BaseField.vue'
import BaseInput from './BaseInput.vue'

function mountField(props: { label: string; hint?: string; error?: string }) {
  return mount(BaseField, {
    props,
    slots: {
      default: (slot: { id: string; describedBy?: string; invalid: boolean }) =>
        h(BaseInput, { id: slot.id, 'aria-describedby': slot.describedBy, invalid: slot.invalid }),
    },
  })
}

describe('BaseField', () => {
  it('links the label to the input', () => {
    const wrapper = mountField({ label: 'Domaine' })
    const input = wrapper.get('input')
    expect(wrapper.get('label').attributes('for')).toBe(input.attributes('id'))
  })

  it('describes the input with its hint', () => {
    const wrapper = mountField({ label: 'Domaine', hint: 'Sans https://' })
    const hintId = wrapper.get('p').attributes('id')
    expect(wrapper.get('input').attributes('aria-describedby')).toBe(hintId)
  })

  it('marks the input invalid and announces the error', () => {
    const wrapper = mountField({
      label: 'Domaine',
      hint: 'Sans https://',
      error: 'Domaine invalide',
    })
    const input = wrapper.get('input')
    const error = wrapper.get('[role="alert"]')

    expect(input.attributes('aria-invalid')).toBe('true')
    expect(input.attributes('aria-describedby')).toContain(error.attributes('id'))
    expect(error.text()).toBe('Domaine invalide')
  })
})
