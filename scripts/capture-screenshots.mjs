/**
 * Captures the product screenshots shown on the landing page (and in the README),
 * in light and dark themes, from a running Atollo: `npm run dev` first, then
 * `npm run capture` (or `node scripts/capture-screenshots.mjs http://localhost:4173`).
 *
 * Real screens of the demo account rather than mockups: what you see is what you get.
 */
import { mkdir } from 'node:fs/promises'
import { chromium } from '@playwright/test'

const BASE_URL = process.argv[2] ?? 'http://localhost:5173'
const OUT_DIR = new URL('../public/screenshots/', import.meta.url)

const SHOTS = [
  { name: 'overview', path: '/s/atelier-nord/overview?period=30d' },
  { name: 'sites', path: '/sites?period=30d' },
  { name: 'locations', path: '/s/atelier-nord/locations?period=90d' },
]

await mkdir(OUT_DIR, { recursive: true })
const browser = await chromium.launch()

for (const theme of ['light', 'dark']) {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 2,
    colorScheme: theme,
    reducedMotion: 'reduce',
  })
  // Signed in to the demo account, with the theme chosen (same keys as the app).
  await context.addInitScript((value) => {
    localStorage.setItem('atollo-session', JSON.stringify({ userId: 'demo' }))
    localStorage.setItem('atollo-theme', value)
  }, theme)
  const page = await context.newPage()

  for (const shot of SHOTS) {
    await page.goto(BASE_URL + shot.path)
    await page.waitForLoadState('networkidle')
    // Development overlays (Vue devtools) have nothing to do in a screenshot.
    await page.addStyleTag({
      content: '#__vue-devtools-container__, #vue-inspector-container { display: none !important }',
    })
    // Wait until every skeleton is gone and the charts are drawn.
    await page.waitForFunction(() => !document.querySelector('[aria-busy="true"]'))
    await page.waitForTimeout(800)
    const file = new URL(`${shot.name}-${theme}.jpg`, OUT_DIR)
    await page.screenshot({ path: file.pathname, type: 'jpeg', quality: 82 })
    console.log(`✓ ${shot.name}-${theme}.jpg`)
  }
  await context.close()
}

await browser.close()
