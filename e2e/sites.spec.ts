import { test, expect } from '@playwright/test'

test('the home page compares every site and opens one with the same period', async ({ page }) => {
  await page.goto('/sites')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Tous les sites')

  const cards = page.getByRole('main').getByRole('list').getByRole('link')
  await expect(cards).toHaveCount(8)
  // The site without tracking explains why it shows nothing.
  await expect(page.getByRole('link', { name: /Maison Tilleul/ })).toContainText(
    'En attente des premières visites',
  )

  await page
    .getByRole('radiogroup', { name: 'Période' })
    .getByRole('radio', { name: '7 j' })
    .click()
  await expect(page).toHaveURL('/sites?period=7d')

  await page.getByRole('link', { name: /Studio Brume/ }).click()
  await expect(page).toHaveURL('/s/studio-brume/overview?period=7d')
})
