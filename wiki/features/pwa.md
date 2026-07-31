# Installable PWA

> The player is an installable Progressive Web App: add-to-home-screen / install, standalone launch,
> and an offline-capable app shell.

**Where** — no new UI. The capability lives in `index.html` (manifest link + meta), the manifest
(`public/manifest.webmanifest`), the service worker (`public/sw.js`), and a registration hook in
`src/main.tsx`. Browsers surface the native "Install app" / "Add to Home Screen" affordance.

**What users see**
- An **Install** option in the browser (Chrome/Edge desktop + Android) or **Add to Home Screen**
  (iOS Safari). Installing gives a real app icon (the green dragon, matching the OG card) + name.
- Launched from the icon, the app runs **standalone** — no browser chrome/address bar.
- The OS window/status-bar chrome is tinted to the app background and **tracks the Good/Evil theme
  toggle** (via the live `<meta name="theme-color">`).
- Once the app has loaded through the worker (the shell is cached on the reload after the first
  visit, since the default lifecycle only controls the *next* navigation), the **app shell works
  offline** (blurred map, panel, controls all render). Audio does **not** play offline — the ~63 MB
  soundtrack is deliberately not cached (see backlog).

**How it's wired**
- `public/manifest.webmanifest` — `display: standalone`, `start_url:/`, `theme_color`/
  `background_color` = Good `--bg-base` `#0a0f18`, icons 192/512 `any` + 512 `maskable`.
- Icons are minted from the game art by `scripts/extract-art.ts` (green dragon `MONS32 #35` on the
  themed square via `compositeOnOpaque`); gitignored + regenerated with `yarn extract:art`. See
  [[asset-extraction]].
- `public/sw.js` — a hand-rolled **runtime-caching** service worker: network-first for navigations
  (offline-fallback to the cached shell), cache-first for immutable hashed `/assets/*`, network-first
  (cache-fallback) for other same-origin assets (art/fonts/manifest/icons) so their revalidatable
  `_headers` aren't frozen, `/audio/*` bypassed, no precache manifest, default lifecycle (no
  `skipWaiting`). Registered **only in production**
  (`import.meta.env.PROD`) at the end of `src/main.tsx`, so the dev server + Playwright suite never
  get a SW. See [[2026-07-31-pwa]] for the shape rationale.
- `theme-color` sync: `src/theme/useTheme.ts::applyTheme` updates the meta alongside `data-theme`;
  the pre-paint IIFE in `index.html` sets it for the returning-user's stored theme.
- `public/_headers` pins `/sw.js` + `/manifest.webmanifest` to `max-age=0, must-revalidate` so a SW
  fix is always recoverable — a bad SW can't be edge-purged. Recovery: [[pwa-recovery]].

**Specs** — `src/test/pwa-manifest.test.ts` (manifest field/icon guard + theme-color-on-toggle via
`renderHook`); `e2e/pwa.spec.ts` (manifest link resolves, `display: standalone`, apple/theme-color
meta present). SW registration + offline shell are verified manually against `yarn preview` (the SW
is PROD-gated, so it doesn't run under the dev-server e2e suite). See [[testing]].
