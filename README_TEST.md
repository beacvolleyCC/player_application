# AKTUÁLIS TELEPÍTÉSI ÚTVONAL — 2026-10-30 (Workers)

A Player TEST-et a Manager TEST-tel azonos módon, **Cloudflare Workers Static Assets** szolgáltatással telepítjük. A meglevő `wrangler.jsonc` Worker neve `cc-player-test-beac`, a forrás `beacvolleyCC/player_application`, a kizárólagos TEST branch `test/20261026-isolated-player-mobile`. Build: `node scripts/build-cloudflare-test.cjs`; deploy: `npx wrangler deploy` a build után. Külön repo, fizetős szolgáltatás, LIVE branch módosítás nem kell.

**Részletes, jelenlegi útmutató:** [docs/TEST_CLOUDFLARE_WORKERS_INSTALL_20261030.md](docs/TEST_CLOUDFLARE_WORKERS_INSTALL_20261030.md).

Az alábbi korábbi GitHub Pages eljárás **csak történeti leírás**, nem az aktuálisan használt útvonal.

---

# Club Control TEST – iPhone Player PWA

The **Player TEST** branch is `beacvolleyCC/player_application:test/20261026-isolated-player-mobile`. This is a DEMO-only PWA, intentionally separate from LIVE Supabase. Orange CC TEST banner and own icon, browser storage keys and service-worker cache.

**Do not copy the whole source repository to a public GitHub repository.** The development repository contains archive and test data that are NOT part of the published static app. Use the vetted PowerShell export:
1. Create a new, empty repository `beacvolleyCC/club-control-player-test`. The GitHub connector used for coding cannot create a new repository.
2. On Windows, clone both the source branch and the **new empty** repo into different directories:
```powershell
git clone --depth 1 --branch test/20261026-isolated-player-mobile https://github.com/beacvolleyCC/player_application.git cc-player-test-source
git clone https://github.com/beacvolleyCC/club-control-player-test.git cc-player-test-publish
pwsh -NoProfile -File ./cc-player-test-source/scripts/export-player-test-pages.ps1 -Destination ./cc-player-test-publish
cd cc-player-test-publish
git add .
git commit -m "Publish isolated CC Player TEST demo"
git push -u origin main
```
3. In new repo Settings → Pages choose **GitHub Actions**. The deploy workflow is enabled only for the exact `beacvolleyCC/club-control-player-test` repository.
4. Use the HTTPS GitHub Pages URL reported by the *successful* deployment. On iOS Safari choose Share → Add to Home Screen. The app icon reads CC TEST.
5. Later, only after staging schema/RLS/test accounts and acceptance checks, switch from local DEMO config to Supabase TEST URL and TEST publishable key.

The current site has not been deployed, and the Free Supabase TEST project is still empty as an application backend. LIVE Player stays untouched. No paid resources.
