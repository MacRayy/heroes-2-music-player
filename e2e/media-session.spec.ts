import { expect, test } from '@playwright/test'

import { enterPlayer } from './utils'

test.describe('media session', () => {
  test('exposes now-playing metadata + playback state to the OS', async ({ page }) => {
    await enterPlayer(page)

    const info = await page.evaluate(() => ({
      title: navigator.mediaSession.metadata?.title ?? null,
      artist: navigator.mediaSession.metadata?.artist ?? null,
      artworkCount: navigator.mediaSession.metadata?.artwork.length ?? 0,
      state: navigator.mediaSession.playbackState,
    }))
    expect(info.title).toBe('Main Menu')
    expect(info.artist).toBe('Heroes of Might & Magic II')
    expect(info.artworkCount).toBeGreaterThan(0)
    expect(info.state).toBe('playing')
  })

  test('metadata stays in sync when the track changes', async ({ page }) => {
    await enterPlayer(page)
    await page.getByRole('button', { name: /next track/i }).click()
    await expect
      .poll(() => page.evaluate(() => navigator.mediaSession.metadata?.title ?? ''))
      .not.toBe('Main Menu')
  })
})
