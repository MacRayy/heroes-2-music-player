import { expect, test } from '@playwright/test'

test.describe('start gate', () => {
  test('the two-step intro reveals the player and starts on Main Menu', async ({ page }) => {
    await page.goto('/')

    // Step 1: welcome modal with an Okay button; the player is hidden (faded out).
    const okay = page.getByRole('button', { name: /okay/i })
    await expect(okay).toBeVisible()
    await expect(page.locator('.app')).toHaveClass(/app--hidden/)

    // Step 2: Okay reveals the map + the horse Start button.
    await okay.click()
    const start = page.getByRole('button', { name: /start/i })
    await expect(start).toBeVisible()

    // The horse click opens the player (no longer hidden) on Main Menu.
    await start.click()
    await expect(page.locator('.app')).not.toHaveClass(/app--hidden/)
    await expect(page.locator('.now-playing__title-inner')).toHaveText('Main Menu')
  })
})
