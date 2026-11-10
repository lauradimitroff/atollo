import { test, expect } from '@playwright/test'

test('the devices page shows the split, browsers and systems', async ({ page }) => {
  await page.goto('/s/atelier-nord/devices')

  const tiles = page.getByRole('list', { name: 'Appareils' })
  await expect(tiles.getByRole('button')).toHaveCount(3)
  await expect(tiles.getByRole('button', { name: /Mobile/ })).toContainText('Rebond')
  await expect(page.getByRole('region', { name: 'Navigateurs' })).toContainText('Chrome')
  await expect(page.getByRole('region', { name: 'Systèmes d’exploitation' })).toContainText(
    'Windows',
  )
})

test('a device tile filters the whole analysis', async ({ page }) => {
  await page.goto('/s/atelier-nord/devices')
  const tiles = page.getByRole('list', { name: 'Appareils' })

  await tiles.getByRole('button', { name: /Mobile/ }).click()
  await expect(page).toHaveURL(/device=mobile/)
  await expect(tiles.getByRole('button')).toHaveCount(1)
  await expect(tiles.getByRole('button', { name: /Mobile/ })).toHaveAttribute(
    'aria-pressed',
    'true',
  )

  // Only mobile systems are left.
  const systems = page.getByRole('region', { name: 'Systèmes d’exploitation' })
  await expect(systems).toContainText('iOS')
  await expect(systems).not.toContainText('Windows')
})
