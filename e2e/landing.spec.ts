import { test, expect } from '@playwright/test'

test.describe('signed out', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('the home page presents Atollo and opens the demo in one click', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'Les statistiques de tous vos sites',
    )
    await expect(page.getByRole('img', { name: /Vue d’ensemble d’un site/ })).toBeVisible()

    await page.getByRole('button', { name: 'Explorer la démo' }).first().click()
    await expect(page).toHaveURL('/sites')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Tous les sites')
  })

  test('the logo of the sign-in pages leads to the home page', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('link', { name: 'Atollo, accueil' }).click()
    await expect(page).toHaveURL('/')
  })
})

test('a signed-in visitor gets a way back to the dashboard', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Ouvrir mon tableau de bord' }).first().click()
  await expect(page).toHaveURL('/sites')
})
