# CC-FOLYTATÁS — PLAYER átadás (2026-10-23)

**Állapot:** integrációs tesztág; nem LIVE / nem merge-elve. **Manager fő handover:** [HANDOVER_20261023_CC_CURRENT.md](https://github.com/beacvolleyCC/club-control-manager/blob/integration/20261022-manager-calendar-protocol-crosswalk-qa/docs/handover/HANDOVER_20261023_CC_CURRENT.md).

## Forrás és függőségek

- GitHub repo: `beacvolleyCC/player_application`.
- Aktuális tesztág: `integration/20261022-player-calendar-protocol-qa`.
- Nyitott draft PR [#25](https://github.com/beacvolleyCC/player_application/pull/25): privát Apple Naptár feliratkozás/HTTPS link, revoke és tokenrotáció, PWA.
- Nyitott draft PR [#26](https://github.com/beacvolleyCC/player_application/pull/26): két MRSZ jegyzőkönyv (#2686, #2700) Player-megjelenítési tesztjei.
- Régi [#19](https://github.com/beacvolleyCC/player_application/pull/19): öt bajnokság menetrendi képernyő / 300 régi rekord. Merge-konfliktusos a `main`-hez képest; **ne cherry-pickeld az egész `app.js`-t**.
- Manager [#74](https://github.com/beacvolleyCC/club-control-manager/pull/74) upstream: a hivatalos két eredmény, 38 játékos, kapitány/liberó/stáb és statisztika staged JSON-ja. A két mérkőzés még nincs LIVE.
- A Player `main` legutóbb ellenőrzött HEAD: `8507ea5574bdce6788d77b553faeb66e02592499`.

## Kód és tesztek

A jelenlegi integrációs ág a Player #25 naptárfejlesztését és a #26 jegyzőkönyv tesztjeit együtt tartalmazza, valamint:

1. `app.js`: a canonical 298-as menetrendnek elsőbbsége van a korábbi 300 soros importtal szemben; csak pontos `competitionLabel` szerinti rekordokat vesz át. A teljes címke jelöli a nemet, osztályt és A/B csoportot. Azonos BEAC–Mozdulj nevek férfi I/B-ben és női I-ben **külön** csapatok/mérkőzések.
2. `statistics.js`: az `__ccResultConflict` jelzésű rekordok nem számolódnak bele a részleges eredménystatisztikákba, de maguk az auditadatok megmaradnak.
3. `app.js`: visszaállított `setsFor / setsAgainst` nyert/vesztett szettösszesítés a részleges tabellában; **nem** ad kitalált hivatalos helyezést.
4. `tests/player-canonical-partial-stats-20261022.test.cjs`: 298 canonical vs. 300 régi menetrend, részeredmények és keresztbajnoksági negatív tesztek.
5. `tests/player-official-protocol-20261022.test.cjs`: 3:1-es és 3:2-es eredmény, szettenkénti pontok, MRSZ-kód, kapitány/liberó/csere, stáb és hivatalos személyek.
6. `.github/workflows/integration-calendar-protocol.yml`: naptár, protokoll, meccssorrend, szettstatisztika, tabella, PWA és régi Férfi I/B regressziós QA.

**Legutóbbi sikeres közös Player GitHub Actions futás a kézikönyv megírása előtt:** [#39944249263](https://github.com/beacvolleyCC/player_application/actions/runs/39944249263). A jelenlegi fejlesztési ág készültsége **CI**, nem valódi iOS/Safari bejelentkezett E2E.

**Biztonság:** `CALENDAR_SUBSCRIPTION_ENABLED: false` (a naptár előfizetési UI nem aktiválódik éles adatbázis nélkül), a régi egyszeri export funkció megmarad. Minden új funkció staging/development, nincs LIVE push, adatimport vagy app release.

## Kapcsolódó Manager állapot

Manager tesztág: `integration/20261022-manager-calendar-protocol-crosswalk-qa`. **300 régi menetrendi rekord vs. 298 canonical**, 13 LIVE eredmény. A 11 vitás történeti rekordból 10 canonical *jelölt*, egy pár nélküli BEAC–BEAC. A forrásazonosítók külön figyelembe veszik az idényt, bajnokságot és mindkét csapatazonosítót; a 11 rekord mind manuális felülvizsgálatú, az automatikus aliasírás mindenhol tiltott.

A legújabb folytatási feladat a négy vitás csapatpár (Dág–KÖZGÁZ, Mozdulj–MAFC-Schönherz, KEAC–KRE-B, MTK kék–RKSK) hazai/vendég irányú és dátum szerinti **READ ONLY** forrásauditjának negatív tesztje és pillanatképe. Lásd a Manager fő handovert.

## Kiadásig hátra

- A canonical adatok és a két MRSZ #2686/#2700 jegyzőkönyv biztonságos integrálása a megfelelő bajnoksághoz, miután a backend készen áll.
- A régi #19-es PR-ból csak az igazoltan szükséges képernyőfunkciókat átemelni külön diff- és QA-ellenőrzéssel.
- Valós belépett fiók, szerepkör, iOS Safari / PWA, naptárfeliratkozás és értesítés end-to-end tesztje.
- Kétszeri 11 pontos QA; csak ezután külön kiadási jóváhagyás és release.

**Tilos:** a különböző osztályok/versenycsoportok összevonása, kitalált rang, vitás mérkőzés automatikus felülírása, régi 300 soros import kanonikusnak nyilvánítása, meccs vagy RSVP törlése.
