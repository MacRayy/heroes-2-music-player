import { expect, test } from '@playwright/test'

import { enterPlayer } from './utils'

test.describe('player transport', () => {
  test.beforeEach(async ({ page }) => {
    await enterPlayer(page)
  })

  test('Next advances to a different track', async ({ page }) => {
    const title = page.locator('.now-playing__title-inner')
    await expect(title).toHaveText('Main Menu')
    await page.getByRole('button', { name: /next track/i }).click()
    await expect(title).not.toHaveText('Main Menu')
  })

  test('Play/Pause toggles the transport control', async ({ page }) => {
    const pause = page.getByRole('button', { name: 'Pause' })
    await expect(pause).toBeVisible()
    await pause.click()
    await expect(page.getByRole('button', { name: 'Play' })).toBeVisible()
  })

  test('a category chip filters the soundtrack away from Main Menu', async ({ page }) => {
    await page.getByRole('button', { name: 'Battle' }).click()
    await expect(page.getByRole('button', { name: 'Battle' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await expect(page.locator('.now-playing__title-inner')).not.toHaveText('Main Menu')
  })
})
