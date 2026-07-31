import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { useTheme } from '@/theme/useTheme'

// `public/manifest.webmanifest` isn't a `.json` extension and lives outside tsconfig's
// `include: ["src"]`, so it can't be imported as a JSON module — pull it in as a raw string.
import manifestRaw from '../../public/manifest.webmanifest?raw'

type ManifestIcon = { src: string; sizes: string; type: string; purpose: string }
type WebManifest = {
  name: string
  short_name: string
  start_url: string
  display: string
  theme_color: string
  background_color: string
  icons: ManifestIcon[]
}
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- JSON.parse is `any`; the field assertions below validate the shape.
const manifest = JSON.parse(manifestRaw) as WebManifest

describe('web app manifest', () => {
  it('declares the fields required for an installable standalone PWA', () => {
    expect(manifest.name).toBeTruthy()
    expect(manifest.short_name).toBeTruthy()
    expect(manifest.start_url).toBe('/')
    expect(manifest.display).toBe('standalone')
    expect(manifest.theme_color).toMatch(/^#[0-9a-f]{6}$/v)
    expect(manifest.background_color).toMatch(/^#[0-9a-f]{6}$/v)
  })

  it('ships 192/512 `any` icons plus a 512 `maskable` icon', () => {
    const any = manifest.icons.filter((icon) => icon.purpose === 'any')
    const maskable = manifest.icons.filter((icon) => icon.purpose === 'maskable')
    expect(any.map((icon) => icon.sizes).sort()).toEqual(['192x192', '512x512'])
    expect(maskable.map((icon) => icon.sizes)).toEqual(['512x512'])
    for (const icon of manifest.icons) {
      expect(icon.src).toMatch(/^\/pwa-.*\.png$/v)
      expect(icon.type).toBe('image/png')
    }
  })
})

describe('theme-color meta stays in sync with the theme toggle', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-theme')
    const meta = document.createElement('meta')
    meta.setAttribute('name', 'theme-color')
    meta.setAttribute('content', '#0a0f18')
    document.head.append(meta)
  })
  afterEach(() => {
    document.querySelector('meta[name="theme-color"]')?.remove()
  })

  it('updates the meta content when switching to the Evil theme', () => {
    const { result } = renderHook(() => useTheme())
    act(() => {
      result.current.setTheme('evil')
    })
    expect(document.querySelector('meta[name="theme-color"]')?.getAttribute('content')).toBe(
      '#100f0d',
    )
    act(() => {
      result.current.setTheme('good')
    })
    expect(document.querySelector('meta[name="theme-color"]')?.getAttribute('content')).toBe(
      '#0a0f18',
    )
  })
})
