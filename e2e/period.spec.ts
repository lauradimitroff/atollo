import { test, expect, type Page } from '@playwright/test'

/** Main navigation link: in the sidebar on desktop, behind the menu button on mobile. */
async function navLink(page: Page, isMobile: boolean, name: string) {
  if (isMobile) await page.getByRole('button', { name: 'Ouvrir la navigation' }).click()
  return page.getByRole('navigation', { name: 'Navigation principale' }).getByRole('link', { name })
}

test('the period is stored in the URL and survives navigation and reload', async ({
  page,
  isMobile,
}) => {
  await page.goto('/s/atelier-nord/overview')
  const periods = page.getByRole('radiogroup', { name: 'Période' })
  await expect(periods.getByRole('radio', { name: '30 j' })).toBeChecked()

  await periods.getByRole('radio', { name: '7 j' }).click()
  await expect(page).toHaveURL('/s/atelier-nord/overview?period=7d')
  await expect(periods.getByRole('radio', { name: '7 j' })).toBeChecked()

  // Navigating keeps the period.
  await (await navLink(page, isMobile, 'Trafic')).click()
  await expect(page).toHaveURL('/s/atelier-nord/traffic?period=7d')

  await page.reload()
  await expect(page.getByRole('radio', { name: '7 j' })).toBeChecked()

  await page.goBack()
  await expect(page).toHaveURL('/s/atelier-nord/overview?period=7d')
})

test('an invalid period in the URL falls back to 30 days', async ({ page }) => {
  await page.goto('/s/atelier-nord/overview?period=custom&from=2026-99-99&to=nope')
  await expect(page.getByRole('radio', { name: '30 j' })).toBeChecked()
})
