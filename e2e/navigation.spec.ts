import { test, expect } from '@playwright/test'

test.describe('desktop navigation', { tag: '@desktop' }, () => {
  test('navigates with the sidebar and switches site', async ({ page }) => {
    await page.goto('/s/atelier-nord/overview')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Vue d’ensemble')

    const nav = page.getByRole('navigation', { name: 'Navigation principale' })
    await nav.getByRole('link', { name: 'Pages' }).click()
    await expect(page).toHaveURL('/s/atelier-nord/pages')
    await expect(page).toHaveTitle('Pages · Atollo')

    await page.getByRole('button', { name: /Changer de site/ }).click()
    await page.getByRole('menuitem', { name: 'Studio Brume' }).click()
    await expect(page).toHaveURL('/s/studio-brume/pages')
  })

  test('keeps "Paramètres" active on every settings tab', async ({ page }) => {
    await page.goto('/settings/appearance')
    const nav = page.getByRole('navigation', { name: 'Navigation principale' })
    await expect(nav.getByRole('link', { name: 'Paramètres' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    await expect(nav.getByRole('link', { name: 'Trafic' })).not.toHaveAttribute('aria-current')
  })
})

test.describe('mobile navigation', { tag: '@mobile' }, () => {
  test('opens the drawer, navigates and closes it', async ({ page }) => {
    await page.goto('/s/atelier-nord/overview')

    await page.getByRole('button', { name: 'Ouvrir la navigation' }).click()
    const drawer = page.getByRole('dialog', { name: 'Navigation' })
    await expect(drawer).toBeVisible()

    await drawer.getByRole('link', { name: 'Trafic' }).click()
    await expect(page).toHaveURL('/s/atelier-nord/traffic')
    await expect(drawer).toBeHidden()
  })
})

test('unknown site shows the 404 page', async ({ page }) => {
  await page.goto('/s/inconnu/overview')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page introuvable')
  await expect(page.getByRole('link', { name: 'Voir mes sites' })).toBeVisible()
})
