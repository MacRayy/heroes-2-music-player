# Castle themes mapped to the wrong recordings

> The six base castle themes were titled against the wrong source OGGs since Phase 1.

**Symptom** — Each town theme played the wrong castle's music: `town-knight` (titled "Knight
Castle") actually played `homm2_04`, which is the Sorceress theme. All six base castles were
permuted. Not caught by tests — the manifest bijection test only checks id existence, and titles
were internally self-consistent.

**Root cause** — Phase 1's `src/data/tracks.ts` mapping came from a WebFetch *summary* of fheroes2
`mus.cpp` that was wrong, and the file header comment falsely claimed it was "verified against
fheroes2 mus.cpp." The real `musmap` array declares castles in the order Sorceress, Warlock,
Necromancer, Knight, Barbarian, Wizard (indices 5–10); with the GOG/DOS scheme `file = index − 1`,
`homm2_04` = Sorceress, not Knight. Battles/terrains/menu/victory happened to be correct because
their enum order is sequential; only the castles are declared out of order, so only they were wrong.

**Fix** — Fetched the `musmap` array verbatim from source, then repointed the 6 base castle `src`
values (`town-sorceress → homm2_04` … `town-wizard → homm2_09`), keeping ids/titles/files stable and
regenerating the MP3s with `--force`. `src/data/tracks.ts:52-63`.

**Lessons** — Don't trust an LLM's *summary* of an authoritative mapping — fetch the source array
verbatim. A "verified" comment is worthless without a test that enforces it. Added a `src→title`
guard (`src/test/manifest.test.ts`) that keys on the source file, so a future re-mislabel fails CI.

## References
Commit `🐛 fix mislabeled castle themes + extend soundtrack data`; [[2026-07-22-soundtrack-scope]].
