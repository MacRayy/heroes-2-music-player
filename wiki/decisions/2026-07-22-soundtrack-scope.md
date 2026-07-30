# Extended soundtrack: variants in rotation, stings behind a scope chip

> SW castle alternates play inline; the 20 event stings live in their own scope, not the default rotation.

**Date:** 2026-07-22 **Status:** accepted

## Context

Phase 2 grew the catalog from 19 to 45 tracks: +6 Succession Wars alternate castle recordings
(full-length music) and +20 event stings (~6 s jingles). The player has no track list — navigation
is transport-only (see [[2026-07-22-player-state]]). Dropping 20 six-second jingles into one linear
rotation would both interrupt the listening flow and make individual stings unreachable.

## Options considered

- **A. Inline everything (option C from the user's first pass)** — stings in the default rotation.
  Rejected by the architect: disruptive + undiscoverable.
- **B. Defer stings entirely.**
- **C. Category-scoped rotation** — a small chip row filters what next/prev/shuffle walk; stings get
  their own scope, excluded from the default "all music" scope.

## Decision

**C.** Added `category: 'sting'` and a `Scope` (`'all' | TrackCategory`). `scope='all'` = all music
(`category !== 'sting'`); a `ScopeChips` row (All/Battle/Towns/Terrain/Stings) sets the scope. The
player reducer carries `scope`; `setScope` (via pure `planScopeChange`) rebuilds `order`, keeps the
current track if still in scope (no restart) else jumps to the scope's first (bumps epoch), and
reshuffles within scope when shuffle is on. SW alternates stay `category:'town'` with a
`(Succession Wars)` title, interleaved right after each base twin. **No `edition` field** (YAGNI).

Also in this change:
- **Manual next/prev now always wrap** the ends (circular), independent of repeat; auto-advance
  (`ended`) still honors repeat (stop at end when 'off').
- **Castle labeling bug fixed**: base castle `src` repointed to the authoritative fheroes2 mapping
  (`homm2_04`=Sorceress … `09`=Wizard), ids/titles/files unchanged; guarded by a `src→title` test.

## Consequences

- Stings are only reachable via the Stings chip — intended.
- `SCOPE_ORDER` omits single-track `menu`/`victory` (reachable via `all`).
- MP3s regenerated with `--force` (recordings changed for the relabeled castles).

## Update — 2026-07-30: `campaign` category

Three tracks first filed as stings are actually full-length pieces (~1 MB MP3s, not ~6 s jingles):
**Roland Campaign** (`homm2_23`), **Archibald Campaign** (`homm2_21`), and **AI Turn** (`homm2_27`).
Moved them to a new `campaign` category so they play in the default `all` rotation (category
`!== 'sting'`). `campaign` gets a `CATEGORY_LABELS`/`SCOPE_LABELS` entry ("Campaign") and a crown
`EMBLEMS` fallback, but **no `SCOPE_ORDER` chip** — like `menu`/`victory`, it's reachable only via
`all`. Each gets a bespoke per-id cover (Roland → `PORT0054`, Archibald → `PORT0057`, AI Turn → the
Genie `MONS32` #60). Counts are now **28 music + 17 stings**. Their ids/files keep the historical
`sting-` prefix (renaming would break `?track=` links + audio filenames). — commit
`✨ move campaign themes (Roland/Archibald/AI Turn) into the main rotation`.

## References
- `src/data/tracks.ts`, `src/hooks/usePlayer.ts` (`tracksInScope`, `planScopeChange`, `advance`),
  `src/components/ScopeChips.tsx`, `src/test/{usePlayer,manifest}.test.ts`
- commits `🐛 fix mislabeled castle themes …`, `✨ add … stings`, `✨ add category scope …`
