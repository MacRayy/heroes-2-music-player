# Deploy to Cloudflare Pages

> How to ship the Vite `dist/` bundle to Cloudflare Pages via direct upload.

## Trigger
Releasing a new version of the player — any change to app code, art, fonts, or audio.

## Prerequisites
- Local `HEROES2.AGG` present: the game assets are gitignored and a cloud CI **cannot** build them,
  so the bundle must be built locally.
- Assets generated: `yarn extract:art`, `yarn extract:font`, and the MP3s in `public/audio/`.
- `wrangler` authenticated once (browser OAuth): `npx wrangler login`.

## Steps — one command: `yarn deploy`

`scripts/deploy.ts` does **build → upload → cache purge** in order:
```
yarn deploy
```
- Builds `dist/` (leave `VITE_AUDIO_BASE_URL` unset → audio served same-origin).
- `wrangler pages deploy dist` to project `heroes-2-music-player`, branch `main`.
- Purges the Cloudflare cache **iff** `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ZONE_ID` are set (see
  "Cache purge" below); otherwise it prints a reminder to purge manually.

First-time-only project create: `npx wrangler pages project create heroes-2-music-player
--production-branch=main`. Live at https://heroes-2-music-player.pages.dev + the custom domain
https://homm2musicplayer.com. Optional pre-deploy smoke-test: `yarn preview`.

## Cache purge (do NOT skip)

**Why:** during the deploy propagation window an edge can 404 the just-uploaded, freshly-hashed
`/assets/*.js`, serve Pages' SPA fallback (`index.html`, `200 text/html`) for it, and — because
`_headers` marks `/assets/*` `immutable` — pin that wrong response for a year. Result: a blank page
on that edge (module fails MIME check) even though origin is correct. A purge after every deploy
evicts any such entry before users hit it. (Verified real: 2026-07-28 deploy.)

**Automated (one-time setup):** `yarn deploy` auto-purges when `CLOUDFLARE_PURGE_TOKEN` +
`CLOUDFLARE_ZONE_ID` are present — `scripts/deploy.ts` loads them from a gitignored **`.env`** (so
you don't re-export each time; a real shell env var still wins).
1. **Token:** Cloudflare → My Profile → **API Tokens → Create Token** → custom token with permission
   **Zone → Cache Purge → Purge**, scoped to the `homm2musicplayer.com` zone. Copy it.
2. **Zone id:** Cloudflare dashboard → the `homm2musicplayer.com` zone → **Overview**, right sidebar.
3. Put both in `.env` (never commit — it's gitignored):
   ```
   CLOUDFLARE_PURGE_TOKEN=…
   CLOUDFLARE_ZONE_ID=…
   ```
   Now `yarn deploy` purges automatically at the end. Rotate the token if it ever leaks.
   > **Do not** name it `CLOUDFLARE_API_TOKEN` — that is wrangler's own auth var; a purge-only token
   > under that name breaks `wrangler pages deploy`. Deploy auth comes from your `wrangler login`
   > (re-run `npx wrangler login` if it reports "authentication may have expired").

**Manual fallback** (no token set): Cloudflare dashboard → homm2musicplayer.com → Caching →
Configuration → Purge Everything.

## Verification
- Headers (from `public/_headers`, which Pages honors):
  ```
  curl -sI https://heroes-2-music-player.pages.dev/audio/menu-main.mp3
  ```
  → `content-type: audio/mpeg` + `cache-control: public, max-age=31536000, immutable`. Hashed
  `/assets/*` = immutable 1yr; `/art/*` + `/fonts/*` = 7 days; `/` = `max-age=0, must-revalidate`.
- Load the site: Okay → horse → opens on Main Menu; audio serves `206` (range → seeking works);
  no console errors.

## Notes / gotchas
- **CI can't build the assets**, so we deploy a locally-built `dist/` via direct upload — not a
  Git-connected build. This is why Sevalla static (Git-only) wasn't used; see
  [[decisions/2026-07-28-hosting-cloudflare-pages]].
- Pages limits: unlimited bandwidth (free), 25 MiB/file (our MP3s are ~1–6 MB), 20k files/deploy
  (~83 here).
- Redeploy = `yarn deploy` (build + upload + purge). `index.html` is `must-revalidate`, so new HTML
  is picked up immediately; the purge handles the immutable `/assets/*` edge case above.

## Related
- [[decisions/2026-07-28-hosting-cloudflare-pages]] — why Cloudflare over Sevalla.
- [[integrations/audio-hosting]] — the `VITE_AUDIO_BASE_URL` audio-URL contract.
