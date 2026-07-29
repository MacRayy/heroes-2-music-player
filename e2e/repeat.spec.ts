import { expect, type Page, test } from '@playwright/test'

import { enterPlayer } from './utils'

// Capture the engine's `new Audio()` element so a test can seek it to the end.
const CAPTURE_AUDIO = () => {
  const Orig = window.Audio
  window.Audio = function (...args: unknown[]) {
    // @ts-expect-error test shim over the Audio constructor
    const el = new Orig(...args)
    // @ts-expect-error stash the instance for the test
    window.__audio = el
    return el
  } as unknown as typeof Audio
}

const title = (page: Page): Promise<string> =>
  page
    .locator('.now-playing__title-inner')
    .textContent()
    .then((t) => (t ?? '').trim())

// Jump near the end of the current track and wait for it to finish for real.
const playToEnd = async (page: Page): Promise<void> => {
  await page.evaluate(() => {
    // @ts-expect-error captured above
    const el = window.__audio as HTMLAudioElement
    if (Number.isFinite(el.duration) && el.duration > 1) el.currentTime = el.duration - 0.3
  })
  await page.waitForTimeout(2000)
}

test.describe('repeat modes', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(CAPTURE_AUDIO)
    await enterPlayer(page)
  })

  // Read the engine's native loop flag — this is what the fix drives, and it discriminates the
  // fix from the old seek()+play()-on-ended code (which never set loop) even in Chromium.
  const audioLoop = (page: Page): Promise<boolean> =>
    page.evaluate(() => {
      // @ts-expect-error captured above
      return (window.__audio as HTMLAudioElement).loop
    })

  test('repeat off: does not loop, and a finished track advances to the next', async ({ page }) => {
    expect(await audioLoop(page)).toBe(false)
    const before = await title(page)
    await playToEnd(page)
    await expect(page.locator('.now-playing__title-inner')).not.toHaveText(before)
  })

  test('repeat one: loops natively and replays the same track', async ({ page }) => {
    const repeat = page.getByRole('button', { name: /repeat/i })
    await repeat.click() // off -> all
    await repeat.click() // all -> one
    await expect(repeat).toHaveAccessibleName('Repeat: one')

    // The fix: repeat-one is native looping, not a play()-on-ended.
    expect(await audioLoop(page)).toBe(true)

    const before = await title(page)
    await playToEnd(page)
    await expect(page.locator('.now-playing__title-inner')).toHaveText(before)
    const paused = await page.evaluate(() => {
      // @ts-expect-error captured above
      return (window.__audio as HTMLAudioElement).paused
    })
    expect(paused).toBe(false)
  })
})
