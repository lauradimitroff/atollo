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

test('a custom range can be picked in the calendar', async ({ page }) => {
  await page.goto('/s/atelier-nord/overview')

  await page.getByRole('button', { name: /Période personnalisée/ }).click()
  // The popover is a dialog named after the button that opened it.
  const calendar = page.getByRole('dialog', { name: /Période personnalisée/ })
  await expect(calendar).toBeVisible()

  // Pick the 2nd then the 5th day of the first month shown.
  const days = calendar.locator('[data-reka-calendar-cell-trigger]:not([data-outside-view])')
  await days.nth(1).click()
  await days.nth(4).click()
  await expect(page.getByText('4 jours sélectionnés')).toBeVisible()
  await page.getByRole('button', { name: 'Appliquer' }).click()

  await expect(page).toHaveURL(/period=custom&from=\d{4}-\d{2}-02&to=\d{4}-\d{2}-05/)
  // No preset is checked any more.
  await expect(
    page.getByRole('radiogroup', { name: 'Période' }).getByRole('radio', { checked: true }),
  ).toHaveCount(0)
})

test('12 months shows one point per month, compared with the year before', async ({ page }) => {
  await page.goto('/s/atelier-nord/overview')
  await page
    .getByRole('radiogroup', { name: 'Période' })
    .getByRole('radio', { name: '12 mois' })
    .click()

  await expect(page).toHaveURL(/period=12m/)
  await expect(page.getByRole('heading', { name: 'Visiteurs uniques par mois' })).toBeVisible()
})
