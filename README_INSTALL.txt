CLUB CONTROL PLAYER V2.3.9.1
============================

BASE: live Player HEAD 74c724c + működő V2.3.9.0 push.

ÚJ:
- alsó nav: dupla háromszög / dupla négyzet / dupla kör
- kétlépcsős kijelentkezés
  - Csak erről az eszközről
  - Minden eszközről
  - Mégse
- global logout előtt minden Player push subscription deaktiválása

NEM VÁLTOZIK:
- RSVP / availability
- profil avatar
- díjak / fizetések
- statisztika
- menetrend / naptár logika
- push Edge Function
- Supabase core táblák

TELEPÍTÉSI SORREND:
1. 048_PLAYER_LOGOUT_ALL_PUSH_SAFE.sql
2. verify: mindhárom TRUE
3. teljes Player fájlcsere: index.html, app.js, styles.css, sw.js, config.js
4. GitHub commit/push
5. PWA bezár/újranyit
6. push subscription teszt
7. csak ezután logout teszt
