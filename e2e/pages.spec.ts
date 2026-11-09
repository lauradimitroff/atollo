import { test, expect } from '@playwright/test'

test('the pages table sorts, searches and filters the dashboard', async ({ page }) => {
  await page.goto('/s/atelier-nord/pages')
  const table = page.getByRole('table')
  const firstPage = table.getByRole('rowheader').first()

  // Default: most visited first.
  await expect(table.getByRole('columnheader', { name: 'Visiteurs' })).toHaveAttribute(
    'aria-sort',
    'descending',
  )
  await expect(firstPage).toHaveText('/')

  // Sorting is stored in the URL.
  await table.getByRole('button', { name: 'Taux de sortie' }).click()
  await expect(page).toHaveURL(/sort=exitRate&order=desc/)
  await expect(firstPage).toHaveText('/contact')

  // Searching narrows the rows.
  await page.getByRole('searchbox', { name: 'Rechercher une page' }).fill('blog')
  // /blog and its four articles.
  await expect(table.getByRole('rowheader')).toHaveCount(5)
  for (const header of await table.getByRole('rowheader').allTextContents()) {
    expect(header).toContain('blog')
  }

  // Clicking a page filters the whole dashboard on visits that saw it.
  await table.getByRole('button', { name: /design-tokens/ }).click()
  await expect(page).toHaveURL(/page=%2Fblog%2Fdesign-tokens|page=\/blog\/design-tokens/)
  await expect(page.getByRole('region', { name: 'Filtres actifs' })).toContainText(
    '/blog/design-tokens',
  )
})
