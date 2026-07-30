# Per-track share links

Every track is directly linkable: `https://homm2musicplayer.com/?track=<id>` opens the player on
that track. The goal is community growth — a listener can share "the Warlock town theme" as a URL
instead of "go to the site and click around".

## How it works

- **`src/data/share.ts`** — pure helpers, no DOM:
  - `TRACK_PARAM = 'track'` — the query-param name.
  - `parseTrackParam(search)` — reads `?track=` from a query string and returns the id **only if it
    matches a real track**, else `null`. Unknown/absent ids fall through to the default first track.
  - `trackShareUrl(origin, trackId)` — builds an origin-rooted `/?track=…` link (used by the Share
    button).
- **Deep-link on load** — `usePlayer`'s `useReducer` initializer passes
  `parseTrackParam(window.location.search)` into `createInitialState(volume, initialTrackId?)`. A
  shared **sting** opens the `sting` scope; anything else opens the full-soundtrack `all` scope, with
  the shared track selected (but **not** auto-playing — the start gate / play gesture still governs
  first playback).
- **URL reflects the current track** — a `replaceState` effect keyed on `currentTrack` keeps
  `?track=` in sync as the user navigates (next/prev/scope change), so the address bar is always a
  copy-pasteable link to what's playing. `replaceState` (not `pushState`) so track changes don't
  spam browser history.
- **Share button** (`src/components/ShareButton.tsx`) — in the panel header next to Settings. Uses
  `navigator.share` when available (mobile share sheet), else copies `trackShareUrl(...)` to the
  clipboard and shows transient "Link copied" feedback (`isCopied`). Icons: `ShareIcon` / `CheckIcon`
  (pixel-art grids in `src/ui/icons.tsx`).

## Tests

- `src/test/share.test.ts` — `parseTrackParam` (valid / unknown / absent) + `trackShareUrl` shape.
- `src/test/usePlayer.test.ts` — `createInitialState` with a shared track (music → `all`, sting →
  `sting`, unknown id → default first).
- `e2e/share.spec.ts` — `?track=battle-1` opens on "Battle 1"; the URL reflects the current track and
  updates on Next; the Share control renders.

## Notes / gotchas

- SSR-safe: both the initializer and the reflect effect guard `typeof window === 'undefined'`.
- Not auto-play: a shared link selects the track but respects the browser autoplay gate — the user
  still starts playback, matching the reference site's behavior.
