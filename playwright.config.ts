import { defineConfig, devices } from '@playwright/test'

const PORT = 4288
const BASE_URL = `http://localhost:${PORT}`

// E2E runs against the local dev server, which serves the gitignored game assets from public/.
// A CI runner without a game copy has no assets, so this suite is a local/dev safety net.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    // The horse click is a real user gesture, so autoplay works; this just avoids flakiness
    // if an assertion races the gesture chain.
    launchOptions: { args: ['--autoplay-policy=no-user-gesture-required'] },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `yarn dev --port ${PORT} --strictPort`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
