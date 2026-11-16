import AxeBuilder from '@axe-core/playwright'
import { test, expect, type Page } from '@playwright/test'

/**
 * Automated accessibility audit (axe-core, WCAG 2.2 A and AA rules) of every page,
 * in both themes. axe finds about a third of real issues (contrast, names, roles,
 * structure); the keyboard and screen reader checks of the other specs cover more.
 */

const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

/**
 * `within`: with a dialog or a menu open, only that layer is audited. The page behind
 * is dimmed by the overlay and out of reach: its contrast would be reported wrongly.
 */
async function audit(page: Page, within?: string) {
  // Wait for data and charts: skeletons have nothing to audit.
  await expect(page.locator('[aria-busy="true"]')).toHaveCount(0)
  // Let opening animations end: a half-transparent layer has a misleading contrast.
  await page.waitForFunction(() =>
    document.getAnimations().every((animation) => animation.playState !== 'running'),
  )
  const builder = new AxeBuilder({ page }).withTags(WCAG)
  if (within) builder.include(within)
  const { violations } = await builder.analyze()
  // A readable report when it fails: rule, impact and the elements concerned.
  const report = violations.map((v) => ({
    rule: v.id,
    impact: v.impact,
    help: v.help,
    targets: v.nodes.slice(0, 5).map((n) => n.target.join(' ')),
  }))
  expect(report).toEqual([])
}

const APP_PAGES = [
  '/sites',
  '/s/atelier-nord/overview',
  '/s/atelier-nord/traffic',
  '/s/atelier-nord/pages',
  '/s/atelier-nord/locations',
  '/s/atelier-nord/devices',
  '/settings/profile',
  '/settings/account',
  '/settings/sites',
  '/settings/appearance',
  '/page-inconnue',
]

const PUBLIC_PAGES = ['/', '/login', '/register', '/forgot-password']

for (const theme of ['light', 'dark'] as const) {
  test.describe(`${theme} theme @desktop`, () => {
    test.use({ colorScheme: theme })

    for (const path of APP_PAGES) {
      test(`app page ${path}`, async ({ page }) => {
        await page.goto(path)
        await audit(page)
      })
    }

    test.describe('signed out', () => {
      test.use({ storageState: { cookies: [], origins: [] } })

      for (const path of PUBLIC_PAGES) {
        test(`public page ${path}`, async ({ page }) => {
          await page.goto(path)
          await audit(page)
        })
      }
    })

    test('an open dialog', async ({ page }) => {
      await page.goto('/settings/sites')
      await page.getByRole('button', { name: 'Code de suivi' }).first().click()
      await expect(page.getByRole('dialog')).toBeVisible()
      await audit(page, '[role="dialog"]')
    })

    test('an open menu', async ({ page }) => {
      await page.goto('/s/atelier-nord/overview')
      await page.getByRole('button', { name: /changer de site/ }).click()
      await expect(page.getByRole('menu')).toBeVisible()
      await audit(page, '[role="menu"]')
    })
  })
}

test('the mobile layout, drawer open @mobile', async ({ page }) => {
  await page.goto('/s/atelier-nord/overview')
  await audit(page)
  await page.getByRole('button', { name: 'Ouvrir la navigation' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await audit(page, '[role="dialog"]')
})
