# Club Control Player — két október 21-i hivatalos MRSZ-jegyzőkönyv, 2026-10-25

**Draft [Player PR #28](https://github.com/beacvolleyCC/player_application/pull/28)**; a tényleges PostgreSQL migration + source a külön **[Manager PR #74](https://github.com/beacvolleyCC/club-control-manager/pull/74)** része. A Player PR nem ír adatbázist, nem deployol, nem módosít eventet, meccs-ID-t vagy RSVP-t.

## Forrás
A 2026-10-21-i hivatalos, felhasználó által feltöltött PDF-ek két, már létező mérkőzését:
- `2686` Női Budapest I., MTK Budapest–Panoráma SE **3–1** (4 szett), 19 játékos;
- `2700` Férfi Budapest I/B, Mozdulj SE–MAFC-Vásárhelyi **3–2** (5 szett), 19 játékos;

a Manager #74 staging SQL készíti elő. A közös canonical feed változatlan UUID-jú meglévő meccsként fogja visszaadni őket; önálló új fixture létrehozása tilos.

## Player-bevezetési ellenőrzés
- `tests/fixtures/official-protocols-20261021-manager74-snapshot.json`: **kizárólag tesztadat**, a Manager #74 PDF-kivonat rögzített másolata. NEM éles import, nem új Player eredmény-adattár.
- `tests/player-real-official-protocols-20261021.test.cjs`: mind a 38 sportolót átvezeti a tényleges canonical protokollstruktúrát követő tesztadatra, majd a Player létező `ccPlayerScoreboardHtml_`, `ccPlayerProtocolDetailHtml_`, `ccPlayerOpenProtocol_` funkciókat futtatja.
- Önállóan vizsgálja a 3–1/3–2 szettmegjelenítést, a hivatalos név/nap/bajnokságot, az összes játékos nevét, a két szövetségi csapat párját, kapitány/kezdő/csere/liberó jelölést, a két külön jegyzőkönyv nyitását és az egyező kódú de rossz bajnokságú adat elutasítását.
- A feltöltött PDF **nem bizonyítja a szövetségi profil-URL-t** minden sportolóhoz, ezért Playerben nincs kitalált kattintható link; a jegyzőkönyvet a saját alkalmazás jeleníti meg.
- A még nem élesített adatok miatt a jelenleg élő Player **nem mutatja** ezt a két eredményt; a tesztelt megjelenítési útvonal kész.

CI: `Player canonical fixtures and partial result statistics QA` + három kapcsolódó workflow, a staging változtatások után **4/4 zöld**. [CI](https://github.com/beacvolleyCC/player_application/actions/runs/40187228688).

**Következő:** bejelentkezett Player iOS/mobil UX teszt és tudatos adatbázis-migráció a Manager #74-ből, a Manager #76/Player #28 kompatibilitásának befejezése után. Nincs PR-merge, deploy, LIVE írás.
