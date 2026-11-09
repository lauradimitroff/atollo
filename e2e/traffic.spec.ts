import { test, expect } from '@playwright/test'

test('the traffic page shows the channel mix and filters from its legend', async ({ page }) => {
  await page.goto('/s/velo-comete/traffic')

  const legend = page.getByRole('list', { name: 'Canaux' })
  await expect(legend.getByRole('button')).toHaveCount(6)
  await expect(page.getByRole('region', { name: 'Sites référents' })).toContainText('google.com')
  await expect(page.getByRole('region', { name: 'Campagnes' })).toContainText('velos-electriques')

  // A legend item is a cross filter.
  await legend.getByRole('button', { name: /Campagnes/ }).click()
  await expect(page).toHaveURL(/channel=campaign/)
  await expect(page.getByRole('region', { name: 'Filtres actifs' })).toContainText('Campagnes')
})

test('the tables sort on header click', async ({ page }) => {
  await page.goto('/s/velo-comete/traffic')
  const referrers = page.getByRole('region', { name: 'Sites référents' })

  await referrers.getByRole('button', { name: 'Site', exact: true }).click()
  await expect(referrers.getByRole('columnheader', { name: 'Site', exact: true })).toHaveAttribute(
    'aria-sort',
    'descending',
  )
})

// What proves each page has rendered its widest content (charts, tables).
const READY: Record<string, string> = {
  overview: 'x-vue-echarts svg',
  traffic: 'x-vue-echarts svg',
  pages: 'table th[scope="row"]',
}

for (const [name, ready] of Object.entries(READY)) {
  test(
    `nothing overflows horizontally on a phone: ${name}`,
    { tag: '@mobile' },
    async ({ page }) => {
      await page.goto(`/s/velo-comete/${name}`)
      await expect(page.locator(ready).first()).toBeVisible()

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      )
      expect(overflow).toBe(0)
    },
  )
}
