CLUB CONTROL PLAYER — V2.3.10.13
NOTIFICATION SWIPE MASK / BORDER FIX

MIÉRT KELL EZ A 10.12 UTÁN
- A 10.12-ben csak styles.css + sw.js változott.
- Az index.html cache-bustja viszont 15.11 maradt, ezért iPhone PWA-ban
  a régi CSS tovább élhetett.
- A Safari composited horizontal scroll réteg ráadásul néha a sima
  border-radius/overflow clippinget is megkerüli.

EZ A BUILD
- index.html is változik -> új styles/app cache-bust
- Beállításokban látható build: Player V2.3.10.13
- a swipe-row kapja a fix külső border-t
- Safari/iOS mask kényszeríti a piros actiont a 12px külső íven belülre
- a piros action nem rajzol külön külső radius-t
- browser-native swipe + Scroll Snap változatlan

CSERÉLENDŐ
- index.html
- styles.css
- sw.js

NEM VÁLTOZIK
- app.js tartalma
- config.js
- backend / Supabase
- push / auth / RSVP / payments

TELEPÍTÉS
1. Cseréld le ezt a 3 fájlt a Player repo-ban.
2. Commit + push.
3. iPhone-on zárd be teljesen a Player PWA-t.
4. Nyisd meg egyszer Safari-ból a Player URL-t.
5. Zárd be Safarit / PWA-t, majd nyisd újra a PWA-t.
6. Beállítások -> alul a Build feliratnak ezt KELL mutatnia:
   Player V2.3.10.13
7. Csak akkor teszteld a swipe-ot, ha ez a build látszik.

ELVÁRT
- teljes balra húzásnál a piros jobb felső / jobb alsó sarok
  nem lóghat túl a külső lekerekített kereten.
