CLUB CONTROL PLAYER V2.3.10.26O-P14D
========================================

CÉL
---
- A P14C új csapatlogók + Dark Pro módja megmarad.
- A Player korábbi, már használt appikonját NEM cseréli le ez a build.
- Android/PWA induláskor a teljes splash háttér BEAC-sárga (#f7b700).
- A közepén a repóban már meglévő Player ikon jelenik meg.
- Nincs új maskable ikon, nincs újragenerált logó.

CSERÉLENDŐ / FELTÖLTENDŐ
-------------------------
- app.js
- index.html
- styles.css
- sw.js
- manifest.webmanifest
- assets/team-logos/ teljes mappa

FONTOS – ICONS
---------------
Az icons/ mappát ebből a csomagból szándékosan kihagytuk.
A repóban korábban meglévő icon-192.png, icon-512.png és apple-touch-icon.png maradjon változatlan.

Ha a hibás P14C PWA ikoncsomagot már feltöltötted a repóba, csak az icons/ mappát állítsd vissza a P14C előtti commitból.
A manifest ezután ezeket a régi ikonokat használja.

ANDROID SPLASH
--------------
background_color: #f7b700
theme_color:      #f7b700

Így a meglévő sárga hátterű ikon körül nem külön sárga négyzet látszik, hanem az egész indítóképernyő sárga.

SQL nem változik.
