PLAYER V2.3.10.11 — BROWSER-NATIVE NOTIFICATION SWIPE

Telepítés:
1. A csomagból cseréld a teljes fájlokat:
   - index.html
   - app.js
   - styles.css
   - sw.js
   - config.js
2. SQL / Supabase migráció nem kell.
3. iPhone-on zárd be teljesen a PWA-t, majd nyisd újra.

Teszt:
- Nyiss meg legalább 2-3 értesítést.
- Lassan húzd balra: a kártyát a Safari natív scrollja mozgassa.
- Rövid húzásnál a CSS scroll snap zárja vissza.
- Határozott balra húzásnál a piros Eltüntetés sáv álljon be, majd az értesítés tűnjön el.
- Függőleges görgetés maradjon normális.
- A piros sáv mögött ne jelenjen meg üres terület gyors swipe-nál sem.
