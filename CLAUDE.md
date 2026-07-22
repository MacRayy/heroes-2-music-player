# Heroes of Might & Magic II — Music Player

A themed web music player for the HOMM2 soundtrack, modeled on
[homm3musicplayer.ovh](https://homm3musicplayer.ovh/): a blurred adventure-map background with a
centered, ornate in-game-style panel (album art, track title, transport controls) and two switchable
interface themes (Good / Evil).

**Stack:** Vite + React + TypeScript, **yarn**. Builds to a static bundle deployable to
Vercel/Sevalla. Audio (the game's soundtrack) is transcoded OGG→MP3 and served from `public/audio/`
locally or an object-storage/CDN base URL in production (`VITE_AUDIO_BASE_URL`).

## Project knowledge base — `wiki/`

`wiki/` is an LLM-maintained knowledge base for this project. It captures everything the code alone
doesn't show: architectural patterns, decisions and their rationale, bug postmortems, known hacks
and tech debt, integration contracts, runbooks, in-flight projects, and the domain glossary.

**On every non-trivial task in this project, before starting work:**

- Read `wiki/CLAUDE.md` — the schema. It defines when to update the wiki and how to write pages.
  Treat the schema's "When to update" table as a checklist for the current task.
- Skim `wiki/index.md` — the map of content. Find the pages relevant to the area you're touching.
  Read them. The wiki is the fastest way to absorb context that took prior sessions hours to learn.

**While working:**

- If a decision is made, a non-obvious bug is fixed, a hack is added, an integration changes, a
  domain term comes up, or an incident is handled — create or update the relevant wiki page per the
  schema. Append a one-line entry to `wiki/_log.md`. Wiki updates land in the same commit (or PR) as
  the code change that triggered them, so `git log` ties them together.
- The wiki is excluded from your formatter and type-checker (see `wiki/CLAUDE.md` § Exclusions).
  Mirror that exclusion in your tooling so the agent isn't fighting lint warnings on markdown.

**For new feature work:**

`wiki/architecture.md` contains your project's layered model. Update it as the system evolves;
reference it when scaffolding new features.

## Plan mode challenge protocol

When plan mode is active, run a two-stage challenge: scout the solution space first, then critique
the drafted plan.

**Stage 1 — Scout alternatives (before drafting):**

1. Dispatch the `architect` subagent via the Agent tool, passing the problem statement (not a plan)
   as the prompt. The architect reads tests + wiki only, never source — its job is to propose
   alternatives without anchoring on the existing implementation.
2. Read its ranked candidates and recommendation. You may take its recommendation, or override it —
   but if you override, state your reasoning in the plan itself.
3. Draft the plan using the chosen approach.

**Stage 2 — Critique the drafted plan (before `ExitPlanMode`):**

4. Dispatch the `plan-critic` subagent via the Agent tool, passing the current plan as the prompt.
5. If the critic returns `"needs_revision"`, revise the plan to address every concern and
   re-dispatch. The critic (not the main agent) decides when the plan is "actually a solid and
   elegant solution"; do not self-approve.
6. Only call `ExitPlanMode` once the critic returns `"approved"`.
7. Cap at **5 rounds**. If the critic still isn't satisfied after 5 rounds, stop iterating, present
   the latest plan together with the critic's remaining concerns to the user, and let them decide.

The two agents have complementary jobs: `architect` asks "is this the right shape of solution?";
`plan-critic` asks "is this plan well-scoped and grounded in the codebase?" Reversing them wastes
the architect's challenge on a sunk-cost draft.

## Implementation challenge protocol

After lint/typecheck/tests pass and before declaring the task done:

1. Dispatch the `solution-critic` subagent via the Agent tool, passing a one-paragraph summary of
   intent as the prompt. The critic reads `git diff` itself — do not paraphrase the changes.
2. If the critic returns `"needs_revision"`, address every concern (fix the code, add tests, update
   the wiki, etc.) and re-dispatch.
3. Only declare the task complete once the critic returns `"approved"`.
4. Cap at **5 rounds**. If still not satisfied after 5 rounds, surface the remaining concerns to the
   user.

**Skip both protocols for trivial edits** — typo fixes, comment-only changes, dependency-version
bumps, formatting-only commits. Use them for everything else.

## Pre-PR architectural self-check (optional)

Before opening a PR that introduces a **new pattern, new module, new cross-module dependency, or a
new top-level page/feature surface**, dispatch the `architect` subagent against the PR description
(not the diff). Ask: "given this is what we built — knowing only the contracts and wiki — would you
still recommend this shape?" The blindfold is the point: if a fresh-eyes architect would arrive at
the same shape from the wiki and tests alone, the shape is defensible and the wiki is doing its job.
If not, either we drifted or the wiki is now lying about how the system works — reconcile the
divergence in the PR description before requesting human review.

Skip this for typical bugfix or feature-extension PRs — the cost-to-value is bad when the shape is
not in question.

## Code conventions

Enforced by ESLint (`func-style`, `react/function-component-definition`,
`consistent-type-definitions`, `react/boolean-prop-naming`) and checked by the critics:

- Component return type is `ReactElement` (not `JSX.Element`).
- Import React names directly (`ReactNode`, `RefObject`, …) — never `React.Foo`.
- Everything is a `const` arrow — components and all helper functions; no `function` declarations.
- `type`, not `interface` (exception: `.d.ts` global augmentation must use `interface`).
- Functional style — avoid mutation and `let` reassignment; prefer `map`/`reduce`/spreads.
- Boolean props **and** variables use `is`/`has`/`should` (`can`/`are`/`have`) prefixes.
- `children` props use React's `PropsWithChildren`, not a hand-written `children: ReactNode`.
- Minimal comments — only for a non-obvious _why_ or a required directive (e.g. `eslint-disable`).

## Tooling

- **Package manager:** yarn.
- **Commands:** `yarn lint` (ESLint), `yarn lint:fix`, `yarn format` (Prettier write),
  `yarn format:check`, `yarn typecheck` (`tsc --noEmit`), `yarn test` (Vitest).
- **Excluded from lint/format/typecheck:** `wiki/` (markdown knowledge base) and `public/audio/`
  (generated MP3 assets). See `eslint.config.mjs` ignores, `.prettierignore`, and `tsconfig`
  excludes.
- **Commits:** prefix every commit subject with a gitmoji (e.g. `🎉 begin project`,
  `✨ add player transport`, `🐛 fix seek race`, `📝 update docs`, `🔧 tweak config`,
  `♻️ refactor usePlayer`, `✅ add tests`). Never include a `Co-Authored-By` trailer. Never commit
  generated audio under `public/audio/`, `.env*` files, or `dist/`.
- **Default branch:** `master`. Never commit feature work directly to `master` — branch first.
