# Testing

> Unit tests (Vitest) for pure logic + a Playwright E2E suite for the user-facing flows.

**When** — before every commit/PR; the unit suite is the CI-safe gate, the E2E suite is a
local/pre-push check.

## Unit — `yarn test` (Vitest, CI-safe)

Covers the **pure functions** only (no component rendering):
- `src/hooks/usePlayer.ts` — reducer, `tracksInScope`, `shuffledOrder`, `planScopeChange`,
  `createInitialState`.
- `scripts/icn.ts` — sprite transforms: decode, palette, rotate/scale/crop/keyLuma/tint,
  `padToSquare`.
- `src/data/manifest.ts` — `joinUrl`, `resolveAudioUrl`.
- Manifest bijection guards (audio ↔ tracks, art/cover ↔ assets).

No AGG or generated assets needed — everything runs off committed manifests + synthetic fixtures.

## E2E — `yarn e2e` (Playwright, local only)

`playwright.config.ts` starts `yarn dev` on port 4288 and runs `e2e/*.spec.ts` in headless Chromium:
- `start-gate` — two-step intro (Okay → horse) reveals the player on Main Menu.
- `player` — Next advances the track, Play/Pause toggles, a category chip filters.
- `chrome` — footer Copyrights modal (Escape-closes), fundraising modal + donate link, Settings.

**Gotchas**
- **Not CI-runnable**: the dev server serves the gitignored game assets from `public/`, so a runner
  without a game copy can't start the app. Run locally after `yarn extract:art` / `extract:font` and
  the audio build. See [[backlog]] "E2E in CI".
- One-time browser install: `npx playwright install chromium`.
- `e2e/**` is excluded from ESLint (like `scripts/**`); specs are verified by running, not linting.

## CI — `.github/workflows/ci.yml`

On every push to `master` and every PR, GitHub Actions runs **four jobs in parallel** (matrix,
`fail-fast: false` so all report): `lint`, `format:check`, `typecheck`, `test`. Node 22 + Corepack
(Yarn pinned via `packageManager` in `package.json`), `.yarn/cache` cached by `yarn.lock` hash.

**E2E is deliberately not in CI** — it needs the gitignored game assets to render the app, which a
stock runner doesn't have. Make it a required status check via branch protection once you're happy
with it. Running E2E in CI would need a pre-seeded/synthetic asset bundle (a possible follow-up).
