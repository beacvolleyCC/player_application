# Club Control Player — végleges kiírás és eredménystatisztika, 2026-10-25

**Draft [PR #28](https://github.com/beacvolleyCC/player_application/pull/28)**, **nem éles**. A Managerhez tartozó kiegészítő javítás [PR #76](https://github.com/beacvolleyCC/club-control-manager/pull/76).

**Felhasználói döntés:** az eredetileg belinkelt 2026/27-es menetrend végleges kiírás, ezért a `ccMrszPlayerAllLeagueMatches_` a már működő `canonicalMatches` feedet elsődlegesnek kezeli. A 41 régi BRSZ aliasjelölt azonosítására **nem kell várni** a listához. Ugyanakkor hivatalos mérkőzéseredmény és jegyzőkönyv csak ellenőrzött sportági eredményforrásból kerülhet a játékosstatisztikába.

## Javítás

- A `ccPlayerResultsOnlyStandings_` 3–0, 3–1 szetteredményeinél a `setsFor/setsAgainst` növelés kommentté vált; helyreállítottuk.
- Érvényes eredményekből helyes szettmérleg, hiányzó labdapontoknál továbbra is `pointsFor/Against:null`; részleges adatokból nincs kitalált bajnoki pont vagy hivatalos helyezés.
- Duplikált mérkőzés nem számít kétszer; ellentmondó azonos meccs nem kerül a részleges statisztikába.
- Női I, női II/B, férfi I/B nem keveredik; MTK Budapest és MTK Budapest kék külön csapat.
- Időpont nélküli halasztás: `Halasztva · Időpont nélkül`.
- HTML/SW/JS/CSS PWA cache token: `20261025-authoritative-results-v1`.

QA: `tests/player-results-statistics-20261025.test.cjs` és a régi Men B, MRSZ Tabella, időrend/jegyzőkönyv regressziók: **4/4 GitHub workflow success**, code head `a0fa0d1c350a48f046d1e861a8b29eb42cebba05`. [Tesztfutás](https://github.com/beacvolleyCC/player_application/actions/runs/40186057712).

Manager/Player esemény- és RSVP kulcsok nincsenek módosítva. Manager #74/Player #26 hivatalos 2026-10-21-i meccsjegyzőkönyvei továbbra is staging. #75/#27 régi ID-híd és #72/#25 iOS naptár külön, nem release-feltétel ezekhez a felületi javításokhoz.

**További szükséges QA:** bejelentkezett Player telefonos PWA teszt, Manager–Player közös kiadási ellenőrzés. Nincs merge/deploy/live adatírás.
