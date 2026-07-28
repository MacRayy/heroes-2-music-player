# Heroes of Might & Magic II — Music Player

A themed web music player for the HOMM2 soundtrack, modeled on
[homm3musicplayer.ovh](https://homm3musicplayer.ovh/): a blurred adventure-map background with a
centered, in-game-style panel (album art, track title, transport controls) and two switchable
interface themes (Good / Evil), using **real art, fonts and icons extracted from the game**.

**▶ Live at [homm2musicplayer.com](https://homm2musicplayer.com)**

**Stack:** Vite + React + TypeScript, yarn. Builds to a static bundle hosted on **Cloudflare
Pages**. Audio (the game's soundtrack, transcoded OGG→MP3) ships in the bundle and is served
same-origin from `/audio/`; it can be moved to a CDN / object-storage origin via
`VITE_AUDIO_BASE_URL`.

## Develop

```sh
yarn install
yarn dev          # local dev server
yarn lint         # ESLint
yarn typecheck    # tsc --noEmit
yarn test         # Vitest
yarn build        # production bundle → dist/
```

## Game assets (important)

The UI art, fonts, album covers and the audio are **not committed** to this repository — they are
generated at build time from a **local, legally-owned copy of the game** and are gitignored:

```sh
export HOMM2_DATA_DIR=/path/to/heroes2/data   # contains HEROES2.AGG
yarn extract:art     # UI sprites + album covers → public/art/
yarn extract:font    # bitmap fonts → TTF in public/fonts/
# audio (MP3s) → public/audio/  (see the audio build steps)
```

## Deploy

Hosted on **Cloudflare Pages** via direct upload of the locally-built `dist/` — the game assets are
gitignored, so CI can't build them; the bundle is built on a machine with the game and uploaded:

```sh
yarn build
npx wrangler pages deploy dist --project-name=heroes-2-music-player
```

Full steps (cache-header checks, one-time `wrangler login`) are in
[`wiki/runbooks/deploy-cloudflare.md`](./wiki/runbooks/deploy-cloudflare.md).

## Support

This is a free, non-commercial fan project. Streaming the full soundtrack from a server costs money;
the in-app treasure-chest button links to [Buy Me a Coffee](https://buymeacoffee.com/MacRay) to help
cover hosting. Entirely optional.

## License

The **source code** is released under the [MIT License](./LICENSE).

The **Heroes of Might and Magic II game assets** (music, sprites, fonts, portraits, etc.) are
**not** covered by that license and are **not** owned by this project. They belong to their
respective rights holders (originally New World Computing; rights now held by Ubisoft). This is an
unofficial fan project, not affiliated with or endorsed by Ubisoft. No game assets are redistributed
in this repo — they are extracted locally from a copy of the game you own. If you are a rights
holder and want something taken down, please open an issue.
