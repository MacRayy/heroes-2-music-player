# Dependency updates (Renovate)

> Renovate keeps deps, the Yarn version, and GitHub Actions current; CI gates every bump.

**How it runs** — the hosted **Mend Renovate GitHub App** (free for public repos), reading
`renovate.json` at the repo root. No self-hosted workflow, no token to manage.

**Policy** (`renovate.json`)
- Base: `config:recommended` + `:semanticCommitsDisabled` (repo uses gitmoji, not conventional
  commits) → PR/commit titles get the `⬆️` prefix.
- **Schedule:** weekly, before 6am Monday (Europe/Budapest); `prConcurrentLimit: 5`.
- **Lock file maintenance:** weekly `yarn.lock` refresh.
- **Auto-merge (CI-gated):** all `patch`/`pin`/`digest`, plus `devDependencies` `minor`. These merge
  themselves once the four CI checks (lint/format/typecheck/test) are green.
- **Reviewed manually:** production-dependency `minor` (grouped into one PR) and **all `major`**
  updates (separate PRs, `major` label).
- Dependency Dashboard issue + vulnerability alerts come from `config:recommended`.

**Setup steps**
1. Install the Renovate app: https://github.com/apps/renovate → grant it this repo.
2. Merge the PR that adds `renovate.json`. Renovate opens an onboarding PR first; merge it.
3. For auto-merge to be safe, make the four CI checks **required** in `master` branch protection —
   otherwise Renovate could merge before CI reports. See [[testing]].

**Gotchas**
- Auto-merge relies on CI being a *required* status check; without that, dial auto-merge off (drop
  the `automerge: true` rules) or accept that it merges on its own schedule.
- Renovate also bumps `packageManager` (Yarn) and the Node version / actions in `ci.yml`.
