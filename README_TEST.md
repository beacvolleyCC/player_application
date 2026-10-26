# Club Control Player – elkülönített telefonos TEST
Az eredeti Player #28 kódjára épülő telepíthető PWA DEMÓ módban. **Az éles Player és Manager main ágai változatlanok.** Nincs Supabase, nincs Google Apps Script, nincs push, nincs távoli adatírás, a hálózati API-kéréseket CSP tiltja. A „Jövök/Nem jövök” próba helyben mentődik.

## Külön repo előkészítése
A tesztág: `beacvolleyCC/player_application` → `test/20261026-isolated-player-mobile`. A kívánt új GitHub-repo: **`beacvolleyCC/club-control-player-test`**. Az új repo még **nincs létrehozva** – ezt a GitHub New Repository felületén létre kell hozni. Ezt követően a tesztág fájljai külön Git-történettel kerüljenek az új repo `main` ágára:

```powershell
git clone --depth 1 --branch test/20261026-isolated-player-mobile https://github.com/beacvolleyCC/player_application.git cc-player-test
cd cc-player-test
Remove-Item -Recurse -Force .git
git init -b main
git add .
git commit -m "Isolated Player mobile test PWA"
git remote add origin https://github.com/beacvolleyCC/club-control-player-test.git
git push -u origin main
```
GitHub → új repo → Settings → Pages → Source: **GitHub Actions**. A `.github/workflows/cc-test-pages.yml` CSAK az egzakt `beacvolleyCC/club-control-player-test` repo esetén enged publikálást. A Pages sikeres futása utáni HTTPS URL-t iPhone Safariban megnyitva → Megosztás → Hozzáadás a Főképernyőhöz. Külön neve **CC TEST**, narancssárga **NEM ÉLES** csíkkal.

## Mit lehet tesztelni?
Nézetek, görgetés, sötét mód, eseménykártya, helyi jelenlétjelölés, menetrend, mobilos részletező ablak, iOS kezdőképernyőre telepítés. A demó alapértelmezett eseményei fejlesztési minták. **A 298 valódi mérkőzés, jegyzőkönyv és a bejelentkezési/értesítési rendszer csak külön staging Supabase mellett tesztelhető**.

Az új repo létrehozása/Pages deploy még nem történt meg. A tesztág nem olvashatja és nem módosíthatja az éles sportolók adatait.
A főképernyős ikon is különálló: narancssárga CC TEST feliratú PNG, 180/192/512 méretben.

**Tárhely-izoláció:** minden helyi beállítás/próba-jelentkezés a saját `cc-mobile-test-20261026:` kulcs-előtag alatt él, még akkor is, ha más GitHub Pages PWA ugyanazon domainen fut.
