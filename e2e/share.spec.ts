import { expect, test } from '@playwright/test'

import { enterPlayer } from './utils'

const trackParam = (url: string): string | null => new URL(url).searchParams.get('track')

test.describe('per-track share links', () => {
  test('opening a ?track= link starts the player on that track', async ({ page }) => {
    await page.goto('/?track=battle-1')
    await page.getByRole('button', { name: /okay/i }).click()
    await page.getByRole('button', { name: /start/i }).click()
    await expect(page.locator('.now-playing__title-inner')).toHaveText('Battle 1')
  })

  test('the URL reflects the current track and updates on Next', async ({ page }) => {
    await enterPlayer(page) // opens on Main Menu
    await expect.poll(() => trackParam(page.url())).toBe('menu-main')
    await page.getByRole('button', { name: /next track/i }).click()
    await expect.poll(() => trackParam(page.url())).not.toBe('menu-main')
  })

  test('Share copies the track link to the clipboard when native share is unavailable', async ({
    page,
    context,
  }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    // Force the clipboard fallback by hiding the native share sheet.
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'share', { configurable: true, value: undefined })
    })
    await enterPlayer(page) // opens on Main Menu
    await page.getByRole('button', { name: /share this track/i }).click()
    await expect(page.getByRole('button', { name: /link copied/i })).toBeVisible()
    const copied = await page.evaluate(() => navigator.clipboard.readText())
    expect(copied).toMatch(/\/\?track=menu-main$/)
  })

  test('Share invokes the native share sheet when available', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'share', {
        configurable: true,
        value: (data: ShareData) => {
          ;(window as unknown as { __shared?: ShareData }).__shared = data
          return Promise.resolve()
        },
      })
    })
    await enterPlayer(page) // opens on Main Menu
    await page.getByRole('button', { name: /share this track/i }).click()
    const shared = await page.evaluate(
      () => (window as unknown as { __shared?: ShareData }).__shared,
    )
    expect(shared?.url).toMatch(/\/\?track=menu-main$/)
  })
})
