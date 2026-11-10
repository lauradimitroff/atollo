import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

import { useZodForm } from './useZodForm'

const schema = z.object({ name: z.string().min(2, { error: 'Trop court.' }) })
const options = { errorMessage: () => 'Échec.' }

describe('useZodForm', () => {
  it('validates on submit, then live while the field is fixed', async () => {
    const form = useZodForm(schema, { name: '' }, options)
    const action = vi.fn<(data: { name: string }) => Promise<void>>()

    form.values.value.name = 'A'
    expect(form.errors.value.name).toBeUndefined() // no message before a first submit

    await form.handleSubmit(action)()
    expect(form.errors.value.name).toBe('Trop court.')
    expect(action).not.toHaveBeenCalled()

    form.values.value.name = 'Ada'
    expect(form.errors.value.name).toBeUndefined()
  })

  it('reports success until the next edit, and failure as a form message', async () => {
    const form = useZodForm(schema, { name: 'Ada' }, options)

    await form.handleSubmit(async () => {})()
    expect(form.succeeded.value).toBe(true)
    form.values.value.name = 'Adah'
    expect(form.succeeded.value).toBe(false)

    await form.handleSubmit(() => Promise.reject(new Error('down')))()
    expect(form.formError.value).toBe('Échec.')
  })

  it('knows whether anything changed since the last save', () => {
    const form = useZodForm(schema, { name: 'Ada' }, options)
    expect(form.dirty.value).toBe(false)
    form.values.value.name = 'Adah'
    expect(form.dirty.value).toBe(true)
    form.reset({ name: 'Adah' })
    expect(form.dirty.value).toBe(false)
  })
})
