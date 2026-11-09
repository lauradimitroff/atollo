import { test, expect, type Page } from '@playwright/test'

/** Main navigation link: in the sidebar on desktop, behind the menu button on mobile. */
async function navLink(page: Page, isMobile: boolean, name: string) {
  if (isMobile) await page.getByRole('button', { name: 'Ouvrir la navigation' }).click()
  return page.getByRole('navigation', { name: 'Navigation principale' }).getByRole('link', { name })
}

test('clicking a row filters the whole dashboard', async ({ page }) => {
  await page.goto('/s/atelier-nord/overview')
  const sources = page.getByRole('region', { name: 'Sources' })
  const organic = sources.getByRole('button', { name: /Recherche organique/ })
  await expect(organic).toBeVisible()
  // The row shows its number of visits: once filtered, the KPI must show exactly that.
  const rowVisits = (await organic.locator('.font-mono').first().textContent())!.trim()

  await organic.click()

  await expect(page).toHaveURL(/channel=organic/)
  const chips = page.getByRole('region', { name: 'Filtres actifs' })
  await expect(chips.getByRole('button', { name: /Canal : Recherche organique/ })).toBeVisible()
  await expect(page.getByRole('radio', { name: /^Visites/ })).toContainText(rowVisits)
  await expect(organic).toHaveAttribute('aria-pressed', 'true')

  // A second filter from another card combines with the first one.
  const devices = page.getByRole('region', { name: 'Appareils' })
  await devices.getByRole('button', { name: /Mobile/ }).click()
  await expect(page).toHaveURL(/device=mobile/)
  await expect(chips.getByRole('button')).toHaveCount(3) // 2 chips + "Tout effacer"

  // The back button undoes the last filter.
  await page.goBack()
  await expect(page).not.toHaveURL(/device=mobile/)
  await expect(page).toHaveURL(/channel=organic/)

  // Removing the chip clears the filter.
  await chips.getByRole('button', { name: /Canal : Recherche organique/ }).click()
  await expect(page).not.toHaveURL(/channel=/)
  await expect(chips).toBeHidden()
})

test('filters are kept when moving to another page of the site', async ({ page, isMobile }) => {
  await page.goto('/s/atelier-nord/overview?period=7d&device=mobile')
  await expect(page.getByRole('region', { name: 'Filtres actifs' })).toBeVisible()

  await (await navLink(page, isMobile, 'Trafic')).click()

  await expect(page).toHaveURL('/s/atelier-nord/traffic?period=7d&device=mobile')
  await expect(page.getByRole('region', { name: 'Filtres actifs' })).toBeVisible()
})
