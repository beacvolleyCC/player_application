# Club Control — Player HU/EN i18n handover
**Dátum:** 2026-11-10 (Europe/Budapest)  
**Státusz:** fejlesztés a külön TEST feature ágon; **nem LIVE**, **nincs igazolt TEST webtelepítés**.  
**Közvetlen cél:** az értesítési küldésen kívüli teljes Player felület magyar–brit angol fordítása, ellenőrzése és kizárólag TEST-re való kihelyezése. Az értesítések teljes, címzettenkénti szerveroldali lokalizációja külön következő feladat.

## Repozitórium és védőkorlátok
- Player repo: `beacvolleyCC/player_application`.
- Kizárólagos fejlesztési ág: `feat/player-i18n-en-test-20261110`.
- A handover készítésekor a vizsgált HEAD: `3efb1365b0347af9e78255665b0e7f98bad6235f`. **Folytatás előtt újra le kell kérni a HEAD-et**, mert párhuzamos módosítások lehetnek.
- LIVE: **nem módosítható, nem merge-elhető és nem deployolható külön felhatalmazás nélkül**.
- TEST Supabase projekt: `szzoubvhlwnojtzqjebc`. LIVE Supabase projekt: `snqsxlyhontaepembaic` — kizárólag azonosításra, **soha ne módosítsd ehhez a feladathoz**.
- Az ág `config.js` fájlja a TEST Supabase-ra mutat; a LIVE adatbázis- és legacy API URL-ek nincsenek benne. `PUSH_ENABLED: false`, mert az értesítésküldés külön feladat és nem szabad véletlen éles kézbesítést indítani. **A TEST configot változtatás nélkül ne olvaszd LIVE-ba.**

## A felhasználó által kért, aktuális munka
A felhasználó az alábbiakat szeretné **egy nagy fejlesztési körben, fölösleges közbenső engedélykérések nélkül** befejezni:
1. Bejelentkezés + alapfelület teljes HU/EN.
2. Profil + beállítások teljes HU/EN.
3. Edzések, jelentkezés, státuszslider, lemondás teljes HU/EN.
4. Mérkőzések, tabellák, szűrők teljes HU/EN.
5. Statisztikák és jegyzőkönyvek teljes HU/EN.
6. Minden dinamikus szöveg, létszám, dátum/idő, hiba, tooltip, aria-label stb.
7. Magyar változat változatlan működése; angol `en-GB`; preferencia játékosonként eltárolva; regressziók; TEST-re telepítés.
8. **Nincs felhatalmazás LIVE élesítésre.** A tényleges push/email értesítések címzett nyelvű küldése nincs befejezve, egyelőre ne aktiváld.

## Létrehozott és módosított fájlok
- `i18n.js`: HU/EN kulcsos szótár, `normalizeLanguage`, `translate`, `formatDate`. A paraméteres kulcshelyettesítés korábbi hibája javítva.
- `i18n-static.js`: több száz pontos HU → en-GB felirat, alapképernyők, naptár, verseny, profil, pénzügy, statisztika, hibaüzenetek. Dinamikus regexek: pl. `16 fő`, `Jönnek (5)`, `3 / 12 meccs`, `2. szett:`, magyar dátum és összetett elválasztott címkék. Egyes földrajzi/személy/csapatnevek tudatosan maradnak változatlanul.
- `i18n-dom.js`: teljes DOM felirat- és attribútumfordítás, `MutationObserver`, `localStorage` nyelvi fallback, `CCPlayerLanguage.setLanguage/getLanguage`, `cc-player-language-changed` esemény, lapcím nyelvváltása. Frissülő szövegek HU-forrása és aria/title/placeholder változások is kezelve.
- `index.html`: Magyar / English nyelvválasztó engedélyezve; scriptimportok és PWA cache-busting verzió frissítve.
- `app.js`: `player_settings.language` mentés/betöltés bekötése; `ccDisplayLocale_()` révén HU vagy `en-GB` dátumok; natív megerősítő és alert szövegek; nyelvváltáskor renderelt edzés/menetrend/profil/fizetés/értesítési panel frissítés.
- `sw.js`: i18n fájlok előtöltése és a PWA verzió szinkronja. **A push-megjelenítő továbbra is a szerverről kapott title/body-t jeleníti meg, nincs címzettenkénti fordítás.**
- `config.js`: kizárólag TEST Supabase és push kikapcsolva.
- `tests/i18n.test.js`: nyelvi alapteszt.
- `tests/player-i18n-ui.test.cjs`: kulcsok, dinamikus szöveg, mock DOM nyelvváltás, preferenciamentés és TEST izoláció.
- `.github/workflows/player-i18n-test.yml`: automatikus CI, JS szintaxis, HU/EN regresszió és meglévő mérkőzés/statisztika tesztek.
- `docs/I18N_HU_EN_TEST_PLAN.md`: korábbi alapfelmérés; **elavult részek vannak benne** (például az angol opció már nincs letiltva); a jelen handover az aktuálisabb.

## Ellenőrzések, CI és aktuális problémák
- A JavaScript fájlok szintaktikai ellenőrzése sikeres volt.
- A HU/EN nyelvi és mock DOM tesztek a `42832324534` GitHub Actions futásban **sikeresen lefutottak**.
- Az ugyanebben a futásban szereplő régi `mrsz-standings.test.cjs` regressziós teszt viszont **elbukott**, mert fixen a 2026-10-26-i PWA cache token előtagját várta. A tényleges i18n buildnek dátumos, egységes új asset verziója van. A hibafutás: https://github.com/beacvolleyCC/player_application/actions/runs/42832324534 .
- A legutóbb ellenőrzött HEAD `3efb1365…` már módosította ezt a régi, befagyasztott verzióra ellenőrző tesztet, hogy dátumos, egységes cache tokent validáljon. **Ehhez a HEAD-hez tartozó teljes CI sikerét a handover elkészítésekor még nem sikerült igazolni** — újra kell ellenőrizni.
- Korábbi, `720e49bb…` commitnál egyszerre zöld volt a HU/EN CI, a men-B és a jegyzőkönyv CI, de ez **nem helyettesíti** a jelenlegi HEAD vizsgálatát.
- A tesztek Node alapúak; **valódi iPhone/PWA böngészős E2E, adatbázisos belépés és élő menetrend működésének teljes körű megtekintése még nincs dokumentáltan elvégezve**.
- Nem ismert bizonyított, publikált **TEST Player URL** ezen az új fejlesztési ágon. **Nem szabad azt állítani, hogy telepítve van.**

## További kötelező teendők — ajánlott sorrend
1. **HEAD és CI felmérése:** GitHub branch HEAD, legutolsó Actions futások, sikertelen jobok logjai. A fordítási ágat más beszélgetés is szerkeszthette; csak a friss SHA alapján írj.
2. **Maradék szöveglefedettség ellenőrzése:** `index.html`, `app.js`, `statistics.js`, `competition-context-catalog.js` minden képernyője, natív `alert`/`confirm`, placeholder, aria/title, adatfüggő komponensek. A forrásszintű statikus keresés nem bizonyít 100%-os runtime lefedettséget. Ne fordíts adatbázis enumot, személynevet, csapatnevet, URL-t, protokollazonosítót.
3. **Dátumok és újrarenderelés:** minden időbélyeg `en-GB` megjelenítése, naptár és menetrend render; lehetséges `MutationObserver` futási ciklusok, dinamikus attribútumok, képernyőváltás és eltűnő dialógusok tesztje.
4. **Persistencia:** magyar → angol → app bezárás/újranyitás → belépés → másik eszköz; `player_settings.language` frissülése, lokális fallback, hibahelyzet.
5. **Teljes CI:** `node --check` minden JS fájl, `node --test tests/i18n.test.js tests/player-i18n-ui.test.cjs`, mérkőzés/tabella/statisztika/jegyzőkönyv régi tesztek; jelöld a fix tokenes régi tesztek esetleges elavulását, ne gyengítsd meg a valós regressziós ellenőrzéseket.
6. **TEST deploy:** azonosítsd először a valódi TEST hosztot és deploy mechanizmust (GitHub Pages / Cloudflare); csak a feature ágat, csak a TEST adatbázissal. Nincs automatikusan bizonyított deploy attól, hogy a CI zöld.
7. **Telefonos E2E:** magyar/angol bejelentkezés, profil, beállítás, training RSVP, visszavonás és indok, menetrend grid/calendar, mérkőzések/tabellák, jegyzőkönyv, statisztikák, képernyőolvasó attribútumok és PWA offline update.
8. **Handover/készjelentés:** pontos teszteredmények, TEST URL, ismert korlátok és LIVE érintetlensége. **LIVE deploy csak külön felhasználói engedéllyel.**

## Következő, külön értesítésfeladat
A TEST `player_settings.language` rendelkezésre áll. `player_notifications` és `player_push_outbox` jelenleg előre renderelt HU `title`/`body` mezőket tárolhat, ezért a push kézbesítéshez és az appban visszanézhető történeti értesítésekhez típus/kulcs + paraméter alapú, címzettenként szerveroldali nyelvi renderelés szükséges. Az iOS-en bezárt alkalmazás nem tudja utólag lefordítani a már kiküldött push tartalmát. **A PUSH_ENABLED jelenleg false a TEST branchon.**

## Gyors folytatási üzenet
`CC-FOLYTATÁS: Olvasd el a beacvolleyCC/player_application repo feat/player-i18n-en-test-20261110 ágán a docs/HANDOVER_PLAYER_HU_EN_2026-11-10.md handovert. A teljes Player HU/EN képernyőfordításának hátralévő QA-ját, hibajavítását és kizárólag TEST telepítését folytasd nagyobb, összefüggő lépésekben. Ellenőrizd a branch HEAD-et és a legfrissebb Actions runokat, mert a korábbi CI körben egy elavult PWA verzióteszt bukott, amelynek javítását már commitolták. LIVE-hoz ne nyúlj; a címzettenkénti push lokalizáció külön feladat.`
