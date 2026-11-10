import { describe, expect, it } from 'vitest'

import { passwordChangeSchema, signInSchema, signUpSchema } from './schemas'

const firstError = (result: { success: boolean; error?: { issues: { message: string }[] } }) =>
  result.error?.issues[0]?.message

describe('signInSchema', () => {
  it('trims the e-mail', () => {
    const result = signInSchema.parse({ email: ' laure@studio.example ', password: 'x' })
    expect(result.email).toBe('laure@studio.example')
  })

  it('explains what is missing or wrong, in French', () => {
    expect(firstError(signInSchema.safeParse({ email: '', password: 'x' }))).toBe(
      'Saisissez votre adresse e-mail.',
    )
    expect(firstError(signInSchema.safeParse({ email: 'laure@', password: 'x' }))).toBe(
      'Cette adresse e-mail n’est pas valide.',
    )
  })
})

describe('signUpSchema', () => {
  const valid = { name: 'Laure', email: 'laure@studio.example', password: 'correct horse' }

  it('accepts a long passphrase without symbols', () => {
    expect(signUpSchema.safeParse(valid).success).toBe(true)
  })

  it('requires 8 characters', () => {
    expect(firstError(signUpSchema.safeParse({ ...valid, password: 'short' }))).toBe(
      '8 caractères minimum.',
    )
  })
})

describe('passwordChangeSchema', () => {
  it('refuses a new password identical to the current one, on the new password field', () => {
    const result = passwordChangeSchema.safeParse({
      currentPassword: 'correct horse',
      newPassword: 'correct horse',
    })
    expect(result.error?.issues[0]).toMatchObject({
      path: ['newPassword'],
      message: 'Choisissez un mot de passe différent de l’actuel.',
    })
  })
})
