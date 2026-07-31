import { expect, test } from '@playwright/test'

// The SW is PROD-gated (src/main.tsx), so this covers only the install metadata in the page.
test.describe('PWA install metadata', () => {
  test('links a web app manifest describing a standalone install', async ({ page, request }) => {
    await page.goto('/')
    const href = await page.locator('link[rel="manifest"]').getAttribute('href')
    expect(href).toBe('/manifest.webmanifest')

    const manifest = await (await request.get(href!)).json()
    expect(manifest.display).toBe('standalone')
    expect(manifest.start_url).toBe('/')
    expect(manifest.icons.some((icon: { purpose: string }) => icon.purpose === 'maskable')).toBe(
      true,
    )
  })

  test('exposes the apple-mobile + theme-color meta for iOS/standalone chrome', async ({
    page,
  }) => {
    await page.goto('/')
    await expect(page.locator('meta[name="apple-mobile-web-app-capable"]')).toHaveAttribute(
      'content',
      'yes',
    )
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute(
      'content',
      /^#[0-9a-f]{6}$/,
    )
  })
})
