import { test, expect } from '@playwright/test'

test('home page shows the product name', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle('Atollo')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Atollo')
})
