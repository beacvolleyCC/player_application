# Club Control – Player PWA V1 (statikus teszt)

Ez egy működő, backend nélküli UI/UX prototípus a versenycsapatos játékos klienshez.

## Benne van
- a korábbi BEAC publikus felület sárga/fekete, kártyás stílusa;
- mobil-first kialakítás + dark mode;
- Következő 14 nap jellegű kezdőnézet;
- Jövök / Nem jövök állapot;
- lemondásnál kötelező szabad szöveges indok;
- csapattársak aktuális státuszának lenyitható listája;
- több hónapos Tervező;
- saját statisztika;
- saját adatok, sportorvosi, mezszám/mezméret/igazolás;
- befizetési nézet;
- Hasznos infók;
- localStorage, ezért a tesztben a jelölések frissítés után is megmaradnak;
- manifest + service worker, tehát HTTPS-en/localhoston telepíthető PWA.

## Fontos
Ez a V1 még demóadatokat használ. Nem ír Google Sheetbe, nincs valódi bejelentkezés, és nincs edzői log/backend.

## Gyors helyi teszt
A mappában:
python -m http.server 8080

Majd:
http://localhost:8080

## GitHub Pages
A mappa tartalmát tedd egy repository gyökerébe, majd Settings → Pages → Deploy from branch.

## Következő lépés
A frontend mögé Apps Script API + Google Sheet:
Players, Events, Availability, Attendance, AvailabilityLog, Payments, TeamFees, TeamInfo.


## V2 változások
- középre zárt csapatnév a fejlécben;
- profil + dark mode jobb oldalt;
- státusz szerint halványzöld / halványpiros teljes edzéskártya;
- poszteloszlás a részletes nézetbe került;
- Kezdőlap és Tervező ugyanazt az eventId-t és státuszt használja;
- Tervezőben is kötelező indok a lemondáshoz;
- teljes szezon egyben látszik;
- szűrhető hónap, eseménytípus és saját státusz szerint;
- külön "Csak ahol még nem jeleztem" gyorsszűrő.


## V3 változások
- a főoldali kézi frissítés gomb kikerült;
- kézi frissítés csak másodlagos funkcióként az Én / Alkalmazás résznél;
- Jövök/Nem jövök esetén a teljes összecsukott kártya kap állapotszínt;
- a Jövök/Nem jövök gombsor semleges marad;
- a lenyitott Részletek panel mindig semleges háttérszínű.


## V4 változások
- a játékos részletes edzésnézetéből kikerült a poszteloszlás;
- a Befizetéseim blokk kompakt táblázatos nézetet kapott;
- oszlopok: Tétel / Időszak / Összeg / Állapot;
- mobilon az összeg oszlop automatikusan rejtőzik;
- a Hasznos infókból kikerült a meccsmez sor.


## V5 változások
- a Befizetéseim táblázat függőleges oszlopelválasztókat kapott;
- a fejléc kicsit hangsúlyosabb háttérrel jelenik meg;
- dark mode-ban is külön kezelt táblázatfejléc.


## V6 változások
- a Befizetéseim rész szezonmátrix lett;
- hónapok felül, tételek bal oldalt;
- a Tétel oszlop mobilon is rögzítve marad;
- a táblázat telefonon vízszintesen görgethető;
- státuszok cellaszínekkel jelölve: fizetve / fizetendő / nincs adat.


## V7 változások
- a Kezdőlapon csak a jövőbeli alkalmak maradnak;
- az elmúlt események automatikusan eltűnnek a fő listából;
- a Tervezőben a lezárt alkalmak bent maradnak;
- játékosként a lezárt alkalmak csak olvashatók, a státuszgombok le vannak tiltva;
- a lezárt sorok szürkítve és „Lezárt” címkével jelennek meg;
- a demo fix dátuma 2026-09-05, ezért az aug. 30., szept. 1. és szept. 4. alkalmak archívként látszanak.


## V8 változások
- kb. fele magasabb helyett kompakt, 70 px-es fejléc;
- CLUB CONTROL és 2026/27 egy sorban, azonos tipográfiával;
- Következő alkalmak külön panel, jobb oldali másodlagos frissítés gombbal;
- Tervező neve Menetrend;
- Kártya / Rács nézetváltó;
- mobilon a szűrők teljes szélességben, egymás alatt;
- státusz-szűrő kikerült, maradt a hónap, típus és „még nem jeleztem”;
- 3 állású jelenléti slider: Nem jövök / Nincs jelzés / Jövök;
- Jövök -> semleges visszaállításnál megerősítés;
- Nem jövök -> kötelező indok;
- edzés / hazai meccs / idegenbeli meccs külön ikon és címke;
- idegenbeli meccsnél kattintható Google Maps link;
- meccsnél találkozási idő/hely megjelenítés;
- súgó gomb a fejlécben;
- játékos kártya és Menetrend rács ugyanazokat az ikonokat használja.


## V9 változások
- Jövök balra, Nincs jelzés középen, Nem jövök jobbra;
- a háromállású vezérlő kattintható és húzható;
- a teljes összecsukott kártya, a sliderrel együtt, zöld/piros; a Részletek mindig semleges;
- a slider előtti elválasztóvonal kikerült, csak a Részletek előtt marad vonal;
- létszám a jobb felső sarokban, háttérbadge nélkül; 10+ zöld, 6–9 sárga, 6 alatt piros;
- az idegenbeli meccs extra adatai kompaktak és csak Részletes módban jelennek meg;
- Menetrend: kártya/rács nézet ikonokkal, felirat nélkül, a címmel egy sorban;
- külön Részletes nézet kapcsoló, mindkét menetrend-nézetre;
- a rácsnézet kompakt kártyarács lett, nem külön Dátum/Típus/Alkalom oszlopos tábla;
- a rácsnézetben is ugyanaz a 3 állású jelenléti vezérlő és állapotszínezés működik;
- a kérdőjel kikerült a fejlécből;
- Profil > Beállítások panelből nyílik a súgó, részletes nézet és kézi adatfrissítés.


## V10
- Google Sheet / Apps Script backend csatlakozás;
- emailhez kötött teszt-belépés;
- valódi Events / Availability adatlekérés és státuszmentés;
- a három csapat szeptemberi tesztadatbázisához előkészítve;
- `config.js`-ben állítható Apps Script Web App URL.
