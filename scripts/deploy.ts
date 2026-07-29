// One-shot production deploy: build -> upload to Cloudflare Pages -> purge the CDN cache.
// The purge closes the propagation-race window where an edge can cache Pages' SPA fallback under a
// freshly-hashed asset URL and pin it via the immutable header. See wiki/runbooks/deploy-cloudflare.md.
import { execSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'

const PROJECT = 'heroes-2-music-player'

const run = (cmd: string): void => {
  console.log(`\n$ ${cmd}`)
  execSync(cmd, { stdio: 'inherit' })
}

// Load CLOUDFLARE_* from a gitignored .env so `yarn deploy` auto-purges without exporting them each
// time. A real shell env var always wins; existing keys are never overwritten.
const loadEnvFile = (path: string): void => {
  if (!existsSync(path)) {
    return
  }
  for (const raw of readFileSync(path, 'utf8').split('\n')) {
    const line = raw.trim()
    const eq = line.indexOf('=')
    if (line === '' || line.startsWith('#') || eq === -1) {
      continue
    }
    const key = line.slice(0, eq).trim()
    if (key === '' || process.env[key] !== undefined) {
      continue
    }
    process.env[key] = line
      .slice(eq + 1)
      .trim()
      .replace(/^["']|["']$/g, '')
  }
}

const purge = async (token: string, zone: string): Promise<void> => {
  console.log('\nPurging Cloudflare cache…')
  const res = await fetch(`https://api.cloudflare.com/client/v4/zones/${zone}/purge_cache`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ purge_everything: true }),
  })
  const body = (await res.json()) as { success?: boolean; errors?: unknown }
  if (!res.ok || body.success !== true) {
    console.error(`✗ cache purge failed: ${JSON.stringify(body)}`)
    process.exit(1)
  }
  console.log('✔ cache purged')
}

const main = async (): Promise<void> => {
  loadEnvFile('.env')
  run('yarn build')
  run(`npx wrangler pages deploy dist --project-name=${PROJECT} --branch=main --commit-dirty=true`)

  const token = process.env.CLOUDFLARE_API_TOKEN ?? ''
  const zone = process.env.CLOUDFLARE_ZONE_ID ?? ''
  if (token === '' || zone === '') {
    console.log(
      '\n⚠ Skipping cache purge — set CLOUDFLARE_API_TOKEN + CLOUDFLARE_ZONE_ID to automate it.\n' +
        '  Otherwise purge manually: Cloudflare dashboard → homm2musicplayer.com → Caching → Purge Everything.',
    )
    return
  }
  await purge(token, zone)
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
