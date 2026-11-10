import { test, expect, type Page } from '@playwright/test'

test('the demo account explains why its settings are locked', async ({ page }) => {
  await page.goto('/settings/profile')
  await expect(page.getByRole('note')).toContainText('Compte de démonstration')
  await expect(page.getByLabel('Nom')).toBeDisabled()

  await page.goto('/settings/account')
  await expect(page.getByRole('button', { name: 'Supprimer mon compte' })).toBeDisabled()
})

test.describe('with an account of its own', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  const PASSWORD = 'une phrase assez longue'

  async function signUp(page: Page) {
    await page.goto('/register?redirect=/settings/profile')
    await page.getByLabel('Nom').fill('Sam Test')
    await page.getByLabel('Adresse e-mail').fill('sam@studio.example')
    await page.getByLabel('Mot de passe', { exact: true }).fill(PASSWORD)
    await page.getByRole('button', { name: 'Créer mon compte' }).click()
    await expect(page).toHaveURL('/settings/profile')
  }

  test('renames the account', async ({ page }) => {
    await signUp(page)
    const save = page.getByRole('button', { name: 'Enregistrer' })
    await expect(save).toBeDisabled() // nothing changed yet

    await page.getByLabel('Nom').fill('Sam Martin')
    await save.click()
    await expect(page.getByRole('status')).toHaveText('Profil enregistré.')
  })

  test('changes the password only with the current one', async ({ page }) => {
    await signUp(page)
    await page.goto('/settings/account')
    const section = page.getByRole('region', { name: 'Mot de passe' })

    await section.getByLabel('Mot de passe actuel').fill('pas le bon')
    await section.getByLabel('Nouveau mot de passe').fill('une autre phrase longue')
    await section.getByRole('button', { name: 'Changer le mot de passe' }).click()
    await expect(section.getByRole('alert')).toHaveText('Mot de passe actuel incorrect.')

    await section.getByLabel('Mot de passe actuel').fill(PASSWORD)
    await section.getByRole('button', { name: 'Changer le mot de passe' }).click()
    await expect(section.getByRole('status')).toHaveText('Mot de passe modifié.')
  })

  test('deletes the account after confirmation', async ({ page }) => {
    await signUp(page)
    await page.goto('/settings/account')

    await page.getByRole('button', { name: 'Supprimer mon compte' }).click()
    const dialog = page.getByRole('alertdialog')
    await dialog.getByLabel('Mot de passe actuel, pour confirmer').fill(PASSWORD)
    await dialog.getByRole('button', { name: 'Supprimer définitivement' }).click()

    await expect(page).toHaveURL('/login?deleted=1')
    await expect(page.getByRole('status')).toContainText('Votre compte a bien été supprimé.')

    await page.getByLabel('Adresse e-mail').fill('sam@studio.example')
    await page.getByLabel('Mot de passe', { exact: true }).fill(PASSWORD)
    await page.getByRole('button', { name: 'Se connecter' }).click()
    await expect(page.getByRole('alert')).toContainText('E-mail ou mot de passe incorrect.')
  })
})
