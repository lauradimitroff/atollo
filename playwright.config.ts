import process from 'node:process'
import { defineConfig, devices } from '@playwright/test'

const isCI = !!process.env.CI

/**
 * See https://playwright.dev/docs/test-configuration.
 * Locally the tests run against the dev server; on CI against the production preview.
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: isCI ? 'github' : 'html',
  use: {
    baseURL: isCI ? 'http://localhost:4173' : 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  // Chromium desktop + a mobile viewport: enough coverage for the responsive layout.
  // Tests tagged @desktop / @mobile only run in the matching project.
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] }, grepInvert: /@mobile/ },
    { name: 'mobile', use: { ...devices['Pixel 7'] }, grepInvert: /@desktop/ },
  ],
  webServer: {
    command: isCI ? 'npm run build-only && npm run preview' : 'npm run dev',
    port: isCI ? 4173 : 5173,
    reuseExistingServer: !isCI,
  },
})
