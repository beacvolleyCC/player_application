# CC-FOLYTATÁS — Player aktuális handover (2026-10-25)

**Állapot:** fejlesztés/draft. Nincs új main merge, nincs Player Pages deploy, és nincs LIVE Supabase DDL/DML. **Az elsődleges teljes projektátadás** a Managerben: [2026-10-25 Club Control current handover](https://github.com/beacvolleyCC/club-control-manager/blob/docs/20261025-current-handover/docs/handover/HANDOVER_20261025_CC_CURRENT.md). Kulcsszó: `CC-FOLYTATÁS`.

## Aktuális Player főág és PR-ek

- GitHub `beacvolleyCC/player_application` `main` a 2026.10.25-i ellenőrzéskor: `8507ea5574bdce6788d77b553faeb66e02592499`.
- **[Player #28](https://github.com/beacvolleyCC/player_application/pull/28)** (HEAD `55eb674f22104cdbc84768c71a4040396ac44cd5`): szettgyőzelem/veszteség számláló fix, részleges eredményből nincs hamis hivatalos táblapont/rang; dátum nélküli halasztás `Halasztva · Időpont nélkül`; egységes PWA cache, a korábban belinkelt végleges menetrend elsőbbsége, in-app jegyzőkönyv és tap/Enter/Space/bezárás QA. **Draft, nem főági release.**
- [Player #26](https://github.com/beacvolleyCC/player_application/pull/26): korábbi MRSZ #2686/#2700 Player QA. A #28 jelentősen bővebb valós adat/render tesztet ad; összevonás előtt duplikáció ellenőrzése.
- [Player #27](https://github.com/beacvolleyCC/player_application/pull/27): régi–új mérkőzésazonosító kapcsolat opcionális v3 klienssel, feature flag OFF. Nem feltétele a meccsek megjelenítésének.
- [Player #25](https://github.com/beacvolleyCC/player_application/pull/25): feliratkozható iOS ICS naptár, külön ellenőrzés, nem élő.
- Manager párjai: **[#74 hivatalos PDF/protokoll SQL](https://github.com/beacvolleyCC/club-control-manager/pull/74)**; **[#76 BEAC/összes meccs és végleges kiírás](https://github.com/beacvolleyCC/club-control-manager/pull/76)**; **[#77 Supabase grants/RLS](https://github.com/beacvolleyCC/club-control-manager/pull/77)**.

## Felhasználói döntés és bajnoki határok

A korábban megadott 2026/27-es **menetrend végleges**. A Player `ccMrszPlayerAllLeagueMatches_` a canonical `v2` snapshot `canonicalMatches` adatát elsődlegesen használja. A 41 régi alias automatikus/egyedi igazolása nem blokkolja a meccslistát. Az eredmények és a jegyzőkönyvek viszont csak hivatalos forrásból fogadhatók el.

- Női Budapest I — BEAC `299`, MTK Budapest `1092`.
- Női Budapest II/B — BEAC II. `959`, MTK Budapest kék `1165`.
- Férfi Budapest I/B — BEAC `709`.
- A többi csoportot tartsd külön, ismétlődő párosításokat ne egyesíts csapatnév/idő alapján.

## A két előkészített hivatalos jegyzőkönyv — MÉG NEM LIVE

| MRSZ | Versenyszint és kezdés (helyi) | Végeredmény | Játszmák | Sportoló |
|---|---|---|---|---|
| `2686` | Női Budapest I, 2026-10-21 21:00 | MTK Budapest – Panoráma SE **3–1** | `25:20,25:9,20:25,25:15` | 19 |
| `2700` | Férfi Budapest I/B, 2026-10-21 20:00 | Mozdulj SE – MAFC-Vásárhelyi **3–2** | `25:18,25:23,21:25,18:25,15:11` | 19 |

Ezek a Manager #74 staged SQL overlay révén **két létező canonical mérkőzésen** jelenhetnek meg. Az adatbázisnak 298 meccse van, a LIVE legutóbbi olvasása szerint 13 played; a tesztmigrációban 15 played és **38 játékosbejegyzés**. A jelenleg élő Player nem állíthatja, hogy ezek már megjelentek. Player nem generál kitalált Hunvolley-profil URL-t.

## Megtörtént tesztek

- **Player #28:** 4/4 workflow zöld a rögzített HEAD commiton, például [canonical/partial standings QA](https://github.com/beacvolleyCC/player_application/actions/runs/40207549418); protokoll, férfi B meccsek, helyes szettmérleg és saját app dialógus.
- **Manager #74 integráció:** a két külön PostgreSQL 17 adatbázis tényleges canonical payload JSON-ját **a Player #28 fix commitjához tartozó `app.js` kóddal** is teszteli; a 38 személy, meccskód+osztály, eredmény, modal/érintés/billentyűzet a teszten átment. [Manager CI](https://github.com/beacvolleyCC/club-control-manager/actions/runs/40239437907).
- **Hozzáférés:** mock JWT + valódi PostgreSQL `SET ROLE` hét szerepkörhelyzettel, aktív/lejárt/inaktív játékos és Manager-jogosultság; jogosulatlan nem olvassa a protokollt. Ez **nem valódi Supabase-belépett session**.

## Nyitott Player release-gate

1. **Valós belépett teszt**: Player aktív csapattag, lejárt/inaktív csapattag, team-scope elutasítás, Manager-felhasználó; RPC `SECURITY DEFINER` jogosultság. Nem lehet pusztán szintetikus QA-ra kiadást alapozni.
2. **Valódi iPhone Safari/PWA**: menetrend, BEAC és külső csapatok, eredménykártya, jegyzőkönyv, görgetés és mobil ablakbezárás, cache, tabella/statisztika, dátum nélküli halasztás; rendes adatokkal.
3. **Kiadási döntés**: Manager #74 migráció és #76 listafunkció + Player #28 tényleges main integrációja, biztonsági QA, 11 pontos kétszeri regresszió, jóváhagyott rollback. Csak ezután production release.
4. **Ne térj vissza a 41 régi ID általános auditjához**; az csak konkrét ütközés esetén külön feladat. Az iOS subscribed ICS és v3 bridge másik kiadási ág.

## Másutt lévő részletes források

- [Manager közös aktuális handover](https://github.com/beacvolleyCC/club-control-manager/blob/docs/20261025-current-handover/docs/handover/HANDOVER_20261025_CC_CURRENT.md)
- [Manager #74 teljes PostgreSQL → Manager/Player auth adatfolyam](https://github.com/beacvolleyCC/club-control-manager/blob/feat/20261022-official-protocols-2686-2700/docs/handover/HANDOVER_20261025_CROSS_APP_AUTH_AND_REAL_PG_PAYLOAD.md)
- [Player #28 PDF consumer QA](https://github.com/beacvolleyCC/player_application/blob/feat/20261025-results-stats-release-check/docs/HANDOVER_20261025_OFFICIAL_PROTOCOL_CONSUMER_QA.md)
- [Manager #77 Supabase explicit grants handover](https://github.com/beacvolleyCC/club-control-manager/blob/qa/20261025-supabase-explicit-grant-guard/docs/handover/HANDOVER_20261025_SUPABASE_EXPLICIT_GRANTS.md)

**Új beszélgetés:** `CC-FOLYTATÁS` — „A Player és Manager 2026-10-25-i átadása alapján folytasd a meccsmodul kiadási ellenőrzését. Az általam belinkelt menetrend végleges; ne vizsgáld újra az összes régi aliast. A #74/#76/#28 draftokból indulj; az aktuális HEAD-et/CI-t ellenőrizd újra. Élesítés, merge és Supabase-írás csak külön engedéllyel.”
