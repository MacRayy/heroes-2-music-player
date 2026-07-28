// Generate the Open Graph / social-share card (public/og.png, 1200x630): the green dragon
// (MONS32 #35) on a dark game-themed card, rendered via headless Chromium. Run: `yarn make:og`.
// Gitignored + regenerable, like the other extracted assets (needs HEROES2.AGG).
import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { chromium } from '@playwright/test'
import { PNG } from 'pngjs'

import { openAgg } from './agg'
import { decodeIcn, loadPalette } from './icn'

const DRAGON_INDEX = 35 // MONS32 green dragon

const main = async (): Promise<void> => {
  const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
  const dataDir =
    process.env.HOMM2_DATA_DIR ??
    join(homedir(), 'Library', 'Application Support', 'fheroes2', 'data')
  const aggPath = join(dataDir, 'HEROES2.AGG')
  if (!existsSync(aggPath)) {
    console.error(`HEROES2.AGG not found at ${aggPath}. Set HOMM2_DATA_DIR.`)
    process.exit(1)
  }

  const agg = openAgg(aggPath)
  const kbpal = agg.records.get('KB.PAL')
  const mons = agg.records.get('MONS32.ICN')
  if (kbpal === undefined || mons === undefined) {
    console.error('KB.PAL or MONS32.ICN missing in AGG')
    process.exit(1)
  }
  const palette = loadPalette(agg.data.subarray(kbpal.offset, kbpal.offset + kbpal.size))
  const sprite = decodeIcn(agg.data.subarray(mons.offset, mons.offset + mons.size), palette)[
    DRAGON_INDEX
  ]
  if (sprite === undefined) {
    console.error(`MONS32 sprite ${DRAGON_INDEX} not found`)
    process.exit(1)
  }
  const png = new PNG({ width: sprite.width, height: sprite.height })
  png.data.set(sprite.rgba)
  const dragon = `data:image/png;base64,${PNG.sync.write(png).toString('base64')}`

  const fontPath = join(repoRoot, 'public', 'fonts', 'homm2-big.ttf')
  const fontFace = existsSync(fontPath)
    ? `@font-face { font-family: 'HOMM2'; src: url(data:font/ttf;base64,${readFileSync(fontPath).toString('base64')}); }`
    : ''
  const display = fontFace === '' ? 'Georgia, serif' : "'HOMM2', Georgia, serif"

  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
    ${fontFace}
    * { margin: 0; box-sizing: border-box; }
    body { width: 1200px; height: 630px; overflow: hidden; }
    .card {
      width: 1200px; height: 630px; display: flex; align-items: center; justify-content: space-between;
      padding: 70px 90px; gap: 40px;
      background:
        radial-gradient(90% 120% at 88% 50%, rgba(120, 200, 90, 0.18), transparent 55%),
        radial-gradient(70% 90% at 12% 40%, rgba(216, 178, 76, 0.14), transparent 60%),
        linear-gradient(160deg, #101a2c 0%, #0a1018 100%);
      border: 10px solid #8a6a12; outline: 3px solid #d8b24c; outline-offset: -20px;
      font-family: ${display};
    }
    .text { display: flex; flex-direction: column; gap: 14px; max-width: 620px; }
    .eyebrow { color: #d8b24c; font-size: 40px; line-height: 1.15; letter-spacing: 0.02em; text-shadow: 0 3px 0 rgba(0,0,0,0.5); }
    .title { color: #f2dd93; font-size: 96px; line-height: 1; text-shadow: 0 4px 0 rgba(0,0,0,0.55); }
    .url { margin-top: 22px; color: #9db07f; font-size: 30px; font-family: Georgia, serif; letter-spacing: 0.04em; }
    .dragon { height: 460px; image-rendering: pixelated; filter: drop-shadow(0 0 34px rgba(120, 220, 90, 0.5)) drop-shadow(0 12px 18px rgba(0,0,0,0.6)); }
  </style></head><body>
    <div class="card">
      <div class="text">
        <div class="eyebrow">Heroes of Might &amp; Magic II</div>
        <div class="title">Music Player</div>
        <div class="url">homm2musicplayer.com</div>
      </div>
      <img class="dragon" src="${dragon}" alt="">
    </div>
  </body></html>`

  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } })
  await page.setContent(html, { waitUntil: 'networkidle' })
  await page.screenshot({
    path: join(repoRoot, 'public', 'og.png'),
    clip: { x: 0, y: 0, width: 1200, height: 630 },
  })
  await browser.close()
  console.log('✔ og image → public/og.png (1200x630)')
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
