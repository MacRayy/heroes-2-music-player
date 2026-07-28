# Hosting: Cloudflare Pages (direct upload)

> Deploy the static bundle to Cloudflare Pages via `wrangler pages deploy`, not Sevalla.

**Date:** 2026-07-28  **Status:** accepted

## Context
The app builds to a static `dist/`, but the game assets (art, fonts, 63 MB audio) are gitignored and
only reproducible from a local `HEROES2.AGG` — a cloud CI build cannot produce them. So the deploy
must ship a **locally-built bundle**, not a Git-connected build.

## Options considered
- **Sevalla static** (the earlier plan) — its static hosting is **Git-connected build only**, no
  pre-built upload. A CI build would publish a site with no art/audio. The only workaround is a
  private repo holding the built `dist/` with the build step off, re-pushing ~90 MB per deploy.
  100 GB/mo free bandwidth, then $0.10/GB.
- **Cloudflare Pages** — supports **direct upload** of a pre-built folder (`wrangler pages deploy
  dist`), honors our `public/_headers`, has **unlimited free bandwidth**, and redeploys in one
  command.

## Decision
Cloudflare Pages, direct upload. It fits the "build locally, upload the folder" constraint natively,
removes the bandwidth-overage risk (a hard $0 ceiling), and needs no second repo.

## Consequences
- Deploys = local `yarn build` + `wrangler pages deploy dist`. See [[runbooks/deploy-cloudflare]].
- Audio is served **same-origin** from Pages (`VITE_AUDIO_BASE_URL` unset → `/audio/`); the
  object-storage-bucket path in [[integrations/audio-hosting]] becomes a deferred optimization, only
  if bandwidth ever climbs.
- Sevalla is dropped for now. The account can stay dormant; the API key pasted during its setup
  should be rotated.

## References
Live at https://heroes-2-music-player.pages.dev · supersedes the Sevalla assumption in
[[integrations/audio-hosting]].
