# CC Player TEST – versenysport tabella és statisztika, 2026-10-27

## Ténylegesen elvégzett műveletek (kizárólag TEST projekt)
TEST Supabase projekt: `szzoubvhlwnojtzqjebc`, éles referencia: `snqsxlyhontaepembaic` (csak olvasás, semmilyen módosítás).

1. A korábban előkészített versenysportos import visszaellenőrzése kimutatta, hogy **nem futott le**: a három tábla üres volt. A mostani munkamenetben tényleges, csak mesterséges TEST adatokat szúrtunk be: 3 csapat/bajnokság-kapcsolat, 12 tabellasor, 6 előre ütemezett mérkőzés.
2. A tesztekhez három, 2026.10.10-i **lezárt, mesterséges** meccseredményt is hozzáadtunk. Végleges ellenőrzött állapot: 3 bajnokság, bajnokságonként 4 tabellasor és 3 meccs, ebből egy lezárt.
3. A Playerhez a tényleges éles JSON szerződést megtartva, külön ellenőrzött forrásból visszaépítettük ezt a három adatbázis-függvényt:
   - `cc_player_competition_standings_v1()`
   - `cc_player_competition_league_insights_v1(p_context_team_id uuid)`
   - `cc_player_competition_insights_v1(p_context_team_id uuid,p_source_team_id text)`
4. Mindhárom függvény **csak a hozzárendelt, aktív Auth-játékos aktív csapattagságából** választ bajnoksági kontextust; nem vegyíti a Női BB1, Női BB2/B és Férfi A ligákat. A hívás jogosulatlan játékosnak megtagadott. Explicit `REVOKE` anon, explicit `GRANT EXECUTE` authenticated; visszaolvasás ellenőrizve.
5. A TEST adatbázisban lefuttatott **12 külön versenysport-konzisztenciaellenőrzés** sikeres: összlétszámok, csapatszintű darabszámok, külön bajnokságnevek, egy fókuszcsapat, minden csapat saját kontextusú mérkőzése, kizárólag `ccTest` jelzésű rekordok. Ezen felül három negatív Auth-funkcióteszt és az API EXECUTE-jogosultságok is ellenőrizve.
6. GitHub TEST ágban statikus Node.js-kódteszt készült a három RPC-kapcsolathoz és a helyes `contextTeamId/sourceTeamId` paraméterezéshez. Ezek önmagukban nem helyettesítik a telefonos bejelentkezési tesztet.

**Korlátok:** A TEST-ben továbbra sincs `auth.users` felhasználó; pozitív hitelesített végpontteszt még nem végezhető el. A Player TEST alkalmazás DEMO módban maradt, nincs külön tényleges HTTPS deployment; e kör nem élesítette a Player TEST webalkalmazást. A forrásban lévő többi versenysportos (MRSZ snapshot/schedule) RPC továbbra is külön helyreállítandó. Valódi játékosadatok nem kerültek át.

**Következő:** hitelesített TEST Auth létrehozása és játékoshoz rendelése csak a megfelelő TEST Dashboardon; jogosult és idegen-csapat kérések funkcionális tesztje; később MRSZ oldalak különítése; TESThez kötött Player PWA. Nem nyúlunk LIVE-hoz, nem kapcsolunk e-mailt/push küldést és nem indítunk fizetős szolgáltatást.
