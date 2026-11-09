import { test, expect } from '@playwright/test'

test('the overview shows KPIs and switches the chart metric', async ({ page }) => {
  await page.goto('/s/atelier-nord/overview')

  const metrics = page.getByRole('radiogroup', { name: 'Métrique affichée sur le graphique' })
  const visitors = metrics.getByRole('radio', { name: /Visiteurs uniques/ })
  await expect(visitors).toBeChecked()
  // A real number, computed from the generated sessions.
  await expect(visitors).toContainText(/\d/)
  await expect(page.getByRole('heading', { name: 'Visiteurs uniques par jour' })).toBeVisible()

  await metrics.getByRole('radio', { name: /Taux de rebond/ }).click()
  await expect(page).toHaveURL(/metric=bounceRate/)
  await expect(page.getByRole('heading', { name: 'Taux de rebond par jour' })).toBeVisible()
})

test('changing the period updates the KPIs and the chart resolution', async ({ page }) => {
  await page.goto('/s/atelier-nord/overview')
  const visits = page.getByRole('radio', { name: /^Visites/ })
  await expect(visits).toContainText(/\d/)
  const thirtyDays = await visits.textContent()

  await page
    .getByRole('radiogroup', { name: 'Période' })
    .getByRole('radio', { name: '24 h' })
    .click()

  await expect(page.getByRole('heading', { name: 'Visiteurs uniques par heure' })).toBeVisible()
  await expect(visits).not.toHaveText(thirtyDays!)
})

test('breakdown cards switch between their tabs', async ({ page }) => {
  await page.goto('/s/atelier-nord/overview')
  const sources = page.getByRole('region', { name: 'Sources' })

  await expect(sources.getByText('Recherche organique')).toBeVisible()
  await sources.getByRole('tab', { name: 'Référents' }).click()
  await expect(sources.getByText('google.com')).toBeVisible()

  const location = page.getByRole('region', { name: 'Localisation' })
  await expect(location.getByText('France')).toBeVisible()
})
