// One-shot production deploy: build -> upload to Cloudflare Pages -> purge the CDN cache.
// The purge closes the propagation-race window where an edge can cache Pages' SPA fallback under a
// freshly-hashed asset URL and pin it via the immutable header. See wiki/runbooks/deploy-cloudflare.md.
import { execSync } from 'node:child_process'

const PROJECT = 'heroes-2-music-player'

const run = (cmd: string): void => {
  console.log(`\n$ ${cmd}`)
  execSync(cmd, { stdio: 'inherit' })
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
