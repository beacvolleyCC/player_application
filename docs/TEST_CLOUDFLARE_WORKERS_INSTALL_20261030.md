# CC Player TEST – Cloudflare Workers Static Assets telepítés
**Dátum:** 2026-10-30

## Cél és elválasztás
- Csak **Player TEST**, külön Cloudflare **Worker** projekt, ugyanabban az ingyenes fiókban mint a Manager TEST.
- Repo: `beacvolleyCC/player_application`
- **Kizárólagos branch:** `test/20261026-isolated-player-mobile`. Semmilyen lépésben ne használd a `main` ágat. Ha a Cloudflare `main`-t választ, telepítés előtt állítsd át a TEST-re.
- Worker név, pontosan a repository `wrangler.jsonc` fájljával egyezően: `cc-player-test-beac`.
- TEST Supabase ref: `szzoubvhlwnojtzqjebc`; LIVE Supabase ref: `snqsxlyhontaepembaic` – az utóbbit soha ne add meg és ne módosítsd.
- A forrás `config.js` szándékosan DEMO; az `scripts/build-cloudflare-test.cjs` generálja a `dist-test/config.js` STAGING konfigurációt. A publishable kulcs publikus, service_role/secret nem kerülhet a kliensbe.

## Telepítés a Cloudflare Dashboardban
1. Lépj be a Cloudflare **Workers & Pages** felületre, válaszd a **Create application** opciót, majd a GitHub-repository importálását a **Workers** építési folyamatban. Nem a régi Pages-projekt lépéseit kell követni.
2. Válaszd a `beacvolleyCC/player_application` repót.
3. Projektnév: `cc-player-test-beac`. A Cloudflare-ben regisztrált Worker neve **pontosan** egyezzen a `wrangler.jsonc.name` értékével, különben a build/deploy hibás lehet.
4. Még az első éles (test Workerre irányuló) deploy előtt ellenőrizd: **Production branch = `test/20261026-isolated-player-mobile`**, nem `main`. Ha a felület ezt az első létrehozás előtt nem engedi, ne fogadj el véletlen main deployt; állítsd be a **Settings → Builds** branch-beállításoknál a deploy előtt vagy kérj segítséget.
5. Root: `/`. Build command: `node scripts/build-cloudflare-test.cjs`. Deploy command: `npx wrangler deploy`. Static assets: `./dist-test` (a repó `wrangler.jsonc` fájljában). Fizetős add-on és környezeti secret nem szükséges.
6. **Save and Deploy**. Nézd meg a Cloudflare Deployments eredményét: helyes Worker, helyes TEST branch, sikeres build + deploy. A GitHub Actions zöld állapota nem helyettesíti a Cloudflare deploy eredményt.
7. Csak a Cloudflare által valóban megadott `workers.dev` HTTPS címet használd. Az URL-t ne a projektnévből következtesd.

## Elfogadási tesztek (mielőtt iPhone-ra telepítjük)
- Worker root: Player **CC TEST · STAGING · NEM ÉLES** felirat; ne a Manager app vagy a LIVE oldal nyíljon meg.
- `/config.js`: csak `szzoubvhlwnojtzqjebc.supabase.co`, semmi `snqsxlyhontaepembaic`; `PUSH_ENABLED:false`, sem service_role, sem secret kulcs.
- `/manifest.webmanifest`, `/sw.js`, `/app.js`: önálló TEST PWA és cache működik.
- Supabase TEST Auth **Redirect URL** engedélyezése a tényleges Player Worker originre (szükség esetén pontos `https://<Cloudflare által kiadott domain>/` útvonal). Ne állítsd a LIVE Auth projektet.
- **Magic Link** levelet küld a már létező TEST Auth felhasználónak, linkre kattintva a Player TEST-re tér vissza és belép. Az automatikus Auth-fiók létrehozás tiltott, `shouldCreateUser:false`. Kódot ne kérj el vagy ossz meg a chatben.
- Valós Player bootstrap: női BB2 TEST csapat, helyes események, jogosultsági szűrés. `Jövök`, `Nem jövök`, semleges + indok és reload/gyors váltás/fail rollback.
- Idegen csapat vagy lejárt/jövőbeni csapattagság ne adjon adathozzáférést. Tartsd meg a Manager #81 regression suite tesztet.
- iOS Safari: Kijelölés → Megosztás → **Főképernyőhöz adás**, cache, bezárás/újranyitás, logout/relogin.
- Player Issue #31 csak sikeres valós end-to-end után zárható. A LIVE érintetlen marad.

## Ellenőrzések
- CI forrásbiztonsági tesztek: `test-cloudflare-workers-static-assets.yml`, `test-player-magiclink-auth.yml`, `cc-test-isolation.yml`.
- A CI és az on-device ellenőrzést egymástól külön naplózd; 2× automata + kézi, 11 pontos QA.
- Ingyenes Cloudflare Workers és Supabase free terv: opcionális fizetős szolgáltatás, push-/SMTP küldés, éles adatmásolás NEM engedélyezett.
- Cloudflare Git integration dokumentáció: https://developers.cloudflare.com/workers/ci-cd/builds/

## Átadás
Ha az első Cloudflare Deployments oldalon látszik a siker, a felhasználó adja meg a tényleges Player TEST URL-t, vagy a dashboard képernyőképét. Utána a valós auth + RSVP tesztekkel folytatjuk.
