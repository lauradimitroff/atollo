import { test, expect, type Page } from '@playwright/test'

/** The account menu lives in the sidebar, a drawer on phones. */
async function showSidebar(page: Page, isMobile: boolean) {
  if (isMobile) await page.getByRole('button', { name: 'Ouvrir la navigation' }).click()
}

// These tests start signed out.
test.use({ storageState: { cookies: [], origins: [] } })

test('the app asks to sign in, then opens the page that was asked for', async ({ page }) => {
  await page.goto('/s/atelier-nord/pages?period=7d')
  await expect(page).toHaveURL(/\/login\?redirect=/)

  await page.getByRole('button', { name: 'Explorer la démo' }).click()
  await expect(page).toHaveURL('/s/atelier-nord/pages?period=7d')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Pages')
})

test('the sign-in form explains its errors', async ({ page }) => {
  await page.goto('/login')

  await page.getByRole('button', { name: 'Se connecter' }).click()
  await expect(page.getByText('Saisissez votre adresse e-mail.')).toBeVisible()
  await expect(page.getByLabel('Adresse e-mail')).toBeFocused()

  await page.getByLabel('Adresse e-mail').fill('inconnu@studio.example')
  await page.getByLabel('Mot de passe', { exact: true }).fill('mauvais mot de passe')
  await page.getByRole('button', { name: 'Se connecter' }).click()
  await expect(page.getByRole('alert')).toContainText('E-mail ou mot de passe incorrect.')
})

test('an account can be created, signed out of and signed in again', async ({ page, isMobile }) => {
  await page.goto('/register')
  await page.getByLabel('Nom').fill('Alex Test')
  await page.getByLabel('Adresse e-mail').fill('alex@studio.example')
  await page.getByLabel('Mot de passe', { exact: true }).fill('une phrase assez longue')
  await page.getByRole('button', { name: 'Créer mon compte' }).click()

  await expect(page).toHaveURL('/sites')
  const account = page.getByRole('button', { name: 'Menu du compte' })

  await showSidebar(page, isMobile)
  await expect(account).toContainText('alex@studio.example')

  await account.click()
  await page.getByRole('menuitem', { name: 'Se déconnecter' }).click()
  await expect(page).toHaveURL('/login')

  await page.getByLabel('Adresse e-mail').fill('ALEX@studio.example')
  await page.getByLabel('Mot de passe', { exact: true }).fill('une phrase assez longue')
  await page.getByRole('button', { name: 'Se connecter' }).click()
  await expect(page).toHaveURL('/sites')
})

test('a link to another site is never followed after signing in', async ({ page }) => {
  await page.goto('/login?redirect=//evil.example')
  await page.getByRole('button', { name: 'Explorer la démo' }).click()
  await expect(page).toHaveURL('/sites')
})

test('a forgotten password gets the same answer whether the account exists or not', async ({
  page,
}) => {
  await page.goto('/forgot-password')
  await page.getByLabel('Adresse e-mail').fill('personne@studio.example')
  await page.getByRole('button', { name: 'Envoyer le lien' }).click()
  await expect(page.getByRole('status')).toContainText('Si un compte existe pour')
})
