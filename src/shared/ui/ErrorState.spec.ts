import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import ErrorState from './ErrorState.vue'

describe('ErrorState', () => {
  it('is announced as an alert and offers a retry', async () => {
    const wrapper = mount(ErrorState, { props: { message: 'Échec du chargement.' } })

    expect(wrapper.attributes('role')).toBe('alert')
    expect(wrapper.text()).toContain('Échec du chargement.')

    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('retry')).toHaveLength(1)
  })
})
