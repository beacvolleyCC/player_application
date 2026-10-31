# Club Control Player TEST — Workers build trigger (2026-10-31)

This documentation-only commit deliberately triggers the Git-integrated Cloudflare Workers build after the user confirmed switching production branch to `test/20261026-isolated-player-mobile`.

- Repository: `beacvolleyCC/player_application`
- Intended Worker: `cc-player-test-beac`
- Build command: `node scripts/build-cloudflare-test.cjs`
- Deploy command: `npx wrangler deploy`
- Static assets: `./dist-test` (from `wrangler.jsonc`)
- TEST Supabase project: `szzoubvhlwnojtzqjebc` only.
- No runtime files, secrets, LIVE branches, LIVE Supabase, or LIVE deployment settings are changed by this commit.

**Verify on Cloudflare Deployments:** a newly triggered build must indicate the isolated TEST branch and successful deploy. GitHub commit/Actions alone do not prove Cloudflare deployment.
