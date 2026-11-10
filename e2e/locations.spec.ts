import { test, expect } from '@playwright/test'

test('the locations page shows the map, countries and cities', async ({ page }) => {
  await page.goto('/s/atelier-nord/locations')

  await expect(page.locator('x-vue-echarts svg').first()).toBeVisible()
  await expect(page.getByRole('heading', { name: /Visites depuis \d+ pays/ })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Pays', exact: true })).toContainText('France')
  await expect(page.getByRole('region', { name: 'Villes' })).toContainText('Paris')

  // The map frames Europe first, the whole world is one click away.
  const zone = page.getByRole('radiogroup', { name: 'Zone affichée' })
  await expect(zone.getByRole('radio', { name: 'Europe' })).toBeChecked()
  await zone.getByRole('radio', { name: 'Monde' }).click()
  await expect(zone.getByRole('radio', { name: 'Monde' })).toBeChecked()
})

test('a country row filters the whole analysis, cities included', async ({ page }) => {
  await page.goto('/s/atelier-nord/locations')
  const countries = page.getByRole('region', { name: 'Pays', exact: true })

  await countries.getByRole('button', { name: /Belgique/ }).click()
  await expect(page).toHaveURL(/country=BE/)
  await expect(page.getByRole('heading', { name: 'Visites depuis 1 pays' })).toBeVisible()

  const cities = page.getByRole('region', { name: 'Villes' })
  await expect(cities).toContainText('Bruxelles')
  await expect(cities).not.toContainText('Paris')
})
