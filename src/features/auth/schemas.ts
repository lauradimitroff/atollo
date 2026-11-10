import { z } from 'zod'

/**
 * Form rules, written once with zod: the same schema validates the form and gives
 * TypeScript the type of the data it returns.
 */

const email = z
  .string()
  .trim()
  .min(1, { error: 'Saisissez votre adresse e-mail.' })
  .pipe(z.email({ error: 'Cette adresse e-mail n’est pas valide.' }))

export const signInSchema = z.object({
  email,
  password: z.string().min(1, { error: 'Saisissez votre mot de passe.' }),
})

/**
 * Length only, no "one capital, one symbol" rule: current guidance (NIST, ANSSI)
 * favors long passphrases, which composition rules tend to discourage.
 */
export const PASSWORD_MIN_LENGTH = 8

export const signUpSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { error: 'Saisissez votre nom (2 caractères minimum).' })
    .max(60, { error: '60 caractères maximum.' }),
  email,
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, { error: `${PASSWORD_MIN_LENGTH} caractères minimum.` })
    .max(128, { error: '128 caractères maximum.' }),
})

export const passwordResetSchema = z.object({ email })
