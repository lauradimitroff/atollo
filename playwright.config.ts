import process from 'node:process'
import { defineConfig, devices } from '@playwright/test'

const isCI = !!process.env.CI
const baseURL = isCI ? 'http://localhost:4173' : 'http://localhost:5191'

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
    baseURL,
    trace: 'on-first-retry',
    // Every test starts signed in to the demo account (e2e/auth.spec.ts starts signed out).
    storageState: {
      cookies: [],
      origins: [
        { origin: baseURL, localStorage: [{ name: 'atollo-session', value: '{"userId":"demo"}' }] },
      ],
    },
  },
  // Chromium desktop + a mobile viewport: enough coverage for the responsive layout.
  // Tests tagged @desktop / @mobile only run in the matching project.
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] }, grepInvert: /@mobile/ },
    { name: 'mobile', use: { ...devices['Pixel 7'] }, grepInvert: /@desktop/ },
  ],
  webServer: {
    // Own, uncommon port: never mixed up with a dev server (5173, 5174…).
    command: isCI
      ? 'npm run build-only && npm run preview'
      : 'npm run dev -- --port 5191 --strictPort',
    port: isCI ? 4173 : 5191,
    env: { E2E: '1' },
    // Always start our own server: reusing whatever answers on the port could test
    // another project by mistake. A busy port now fails loudly instead.
    reuseExistingServer: false,
  },
})
