import { expect, test } from '@playwright/test'

import { enterPlayer } from './utils'

test.describe('page chrome (modals + footer)', () => {
  test.beforeEach(async ({ page }) => {
    await enterPlayer(page)
  })

  test('the footer opens the Copyrights modal and Escape closes it', async ({ page }) => {
    await page.getByRole('button', { name: /copyrights/i }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog).toContainText('not an official product')
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toHaveCount(0)
  })

  test('the fundraising widget opens its modal with a donate link', async ({ page }) => {
    await page.getByRole('button', { name: 'Server fundraising' }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('link', { name: /buy me a brick/i })).toHaveAttribute(
      'href',
      'https://buymeacoffee.com/MacRay',
    )
    await dialog.getByRole('button', { name: /close/i }).click()
    await expect(page.getByRole('dialog')).toHaveCount(0)
  })

  test('Settings opens the settings dialog', async ({ page }) => {
    await page.getByRole('button', { name: 'Settings' }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog).toContainText('Theme')
    await expect(dialog).toContainText('Volume')
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toHaveCount(0)
  })
})
