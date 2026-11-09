import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import TrendSparkline from './TrendSparkline.vue'

describe('TrendSparkline', () => {
  it('draws a line and an area from the values', () => {
    const wrapper = mount(TrendSparkline, { props: { values: [3, 8, 5, 10] } })
    const [area, line] = wrapper.findAll('path')
    // One move then three line segments, from the left edge to the right edge (160).
    expect(line!.attributes('d')).toMatch(/^M0\.0,[\d.]+( L[\d.]+,[\d.]+){2} L160\.0,[\d.]+$/)
    expect(area!.attributes('d')).toContain('Z')
    // Hidden from screen readers: the card states the numbers in text.
    expect(wrapper.attributes('aria-hidden')).toBe('true')
  })

  it('shows a dashed baseline without enough data', () => {
    const wrapper = mount(TrendSparkline, { props: { values: [] } })
    expect(wrapper.find('path').exists()).toBe(false)
    expect(wrapper.find('line').attributes('stroke-dasharray')).toBe('3 4')
  })
})
