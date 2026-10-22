# Player – Apple Naptár + MRSZ 2686/2700 közös QA (2026-10-22)

**Ez kizárólag teszt- és kompatibilitási ág.** Nincs főági merge, Cloudflare Pages élesítés vagy Supabase-adatbázis-módosítás.

## Forráságak

- Player [PR #25](https://github.com/beacvolleyCC/player_application/pull/25): iOS privát `webcal` előfizetés, token rotáció / revoke, PWA cache. `CALENDAR_SUBSCRIPTION_ENABLED: false` marad.
- Player [PR #26](https://github.com/beacvolleyCC/player_application/pull/26): MRSZ #2686 MTK–Panoráma és #2700 Mozdulj–MAFC-Vásárhelyi megjelenítési QA a meglévő Player nézeteken. Csak tesztet emeltünk át a #25 ágba.
- Manager [#74](https://github.com/beacvolleyCC/club-control-manager/pull/74): az eredmények és a 38 játékos official source/adatmodell-feldolgozása, még **nem LIVE**.
- A régi [Player #19](https://github.com/beacvolleyCC/player_application/pull/19) teljes bajnoki menetrend PR GitHub szerint jelenleg nem automatikusan merge-elhető; a kódját nem emeltük át.

## Együtt futó regresszió

A `.github/workflows/integration-calendar-protocol.yml` célzottan futtatja:

- `tests/calendar-subscription.test.mjs`: alapértelmezetten tiltott feliratkozás, token és UI;
- `tests/player-official-protocol-20261022.test.cjs`: mindkét eredménykártya, 4+5 szett, csapatstáb, hivatalos személyek, kapitány, liberó és jelöletlen játékosok;
- `tests/protocol-match-order-20261019.test.cjs`: eredménymegjelenítési sorrend és PWA cache;
- `tests/player-statistics-wl.test.cjs`: játékosstatisztika;
- `tests/mrsz-standings.test.cjs`: hivatalos helyezés kitalálásának tiltása;
- `tests/player-men-b-restore-20261020.test.cjs`: Férfi B adatok és régi jelentkezési / eredmény UX kompatibilitás.

Az első összetett futás zöld: [GitHub Actions 39842720549](https://github.com/beacvolleyCC/player_application/actions/runs/39842720549).

## Fontos határok

A tesztek a meglévő JS megjelenítő függvényeket és szintetikus canonical adatszerkezetet futtatják, **nem** helyettesítik a bejelentkezett iPhone Safari/PWA vizuális ellenőrzését. Ezen az ágon nincs új Manager adatforrás, nincs új sports API, és nincsenek LIVE játszmapontok.

A release-sorrend a Manager [közös integrációs átadásához](https://github.com/beacvolleyCC/club-control-manager/blob/integration/20261022-manager-calendar-protocol-crosswalk-qa/docs/handover/CC_20261022_CROSS_PR_INTEGRATION_QA.md) igazodik. Ne merge-eld a tesztágat `main`-be, amíg a függő canonical adatbázis-migráció és a 11 pontos éles QA nincs jóváhagyva.

## Régi #19 menetrend-PR és új canonical adatmodell — kompatibilitási javítás

A régi Player #19 öt ligás teljes importja pontosan 300 rekordot / 8 eredményt várna, de a jelenlegi canonical forrás a read-only vizsgálatkor 298 rekordot / 13 eredményt tartalmaz. A régi forrásazonosítás nem kerül be automatikusan; a `canonicalMatches` az elsődleges. `public.cc_competition_mrsz_screenshot_v1` aktuális nyers táblájában 326 forrásrekord volt, ebből `ui20261018:%` forráskulccsal 0.

Két biztonságos eltérést átvettem az integrációs Player-ágban:

- `statistics.js` és a részleges állás `app.js` szűri az `__ccResultConflict` jelzésű eredményt: az adat továbbra is ellenőrzésre megmarad, de nem lesz belőle téves győzelem vagy vereség.
- `ccPlayerResultsOnlyStandings_` eddig véletlenül egy megjegyzésbe foglalta a `setsFor` / `setsAgainst` növelését; ezt kijavítottam.
- Új teszt: `tests/player-canonical-partial-stats-20261022.test.cjs` ellenőrzi a részleges eredménysor 3–1-es mérkőzésén a 3/1 szettet, 93:86 szintetikus pontösszeget és a hivatalos helyezés hiányát; a teljes 298 canonical adatokat a 300 régi import elé helyezi.

A Player [Actions 39861553068](https://github.com/beacvolleyCC/player_application/actions/runs/39861553068) közös QA sikeres. Az új kód **csak az integrációs tesztágban van**, nem került sem a Player #25, sem a #26 PR-ba. Nincs LIVE bevezetés, az Apple előfizetés `CALENDAR_SUBSCRIPTION_ENABLED: false` állapotú.

A Manager-oldali eltérések: [CC_20261022_LEGACY_SCHEDULE_CONFLICTS.md](https://github.com/beacvolleyCC/club-control-manager/blob/integration/20261022-manager-calendar-protocol-crosswalk-qa/docs/handover/CC_20261022_LEGACY_SCHEDULE_CONFLICTS.md).
