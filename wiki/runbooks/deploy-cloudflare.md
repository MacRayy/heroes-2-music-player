# Deploy to Cloudflare Pages

> How to ship the Vite `dist/` bundle to Cloudflare Pages via direct upload.

## Trigger
Releasing a new version of the player — any change to app code, art, fonts, or audio.

## Prerequisites
- Local `HEROES2.AGG` present: the game assets are gitignored and a cloud CI **cannot** build them,
  so the bundle must be built locally.
- Assets generated: `yarn extract:art`, `yarn extract:font`, and the MP3s in `public/audio/`.
- `wrangler` authenticated once (browser OAuth): `npx wrangler login`.

## Steps
1. Build the production bundle. Leave `VITE_AUDIO_BASE_URL` unset so audio is served same-origin:
   ```
   yarn build          # dist/ = app + art + fonts + audio + _headers
   ```
2. (Optional) smoke-test locally: `yarn preview` → http://localhost:4173.
3. Deploy the folder (first run also creates the project):
   ```
   npx wrangler pages project create heroes-2-music-player --production-branch=main   # first time only
   npx wrangler pages deploy dist --project-name=heroes-2-music-player --branch=main --commit-dirty=true
   ```
   Live at https://heroes-2-music-player.pages.dev.

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
- Redeploy = rebuild + re-run the `pages deploy` line. `index.html` is `must-revalidate`, so new
  deploys are picked up immediately.

## Related
- [[decisions/2026-07-28-hosting-cloudflare-pages]] — why Cloudflare over Sevalla.
- [[integrations/audio-hosting]] — the `VITE_AUDIO_BASE_URL` audio-URL contract.
