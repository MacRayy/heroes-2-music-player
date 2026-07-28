import { expect, type Page } from '@playwright/test'

// Drive the two-step start gate (Okay → horse) and wait for the player to open on Main Menu.
export const enterPlayer = async (page: Page): Promise<void> => {
  await page.goto('/')
  await page.getByRole('button', { name: /okay/i }).click()
  await page.getByRole('button', { name: /start/i }).click()
  await expect(page.locator('.now-playing__title-inner')).toHaveText('Main Menu')
}
