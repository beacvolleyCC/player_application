CLUB CONTROL PLAYER — V2.3.10.15
MONOCHROME PUSH SETTINGS

Ez a V2.3.10.14 teljes production cleanupját tartalmazza, plusz:
- a kis push állapotjelző pötty teljesen kikerült
- Bekapcsolás és Kikapcsolás gomb fekete/monokróm
- iOS/Safari natív kék gombszín explicit felülírva
- aktív/error állapotban sincs zöld/piros push-kártya kiemelés
- a státusz szöveg is semleges
- dark mode-ban a témához illeszkedő világos foreground marad olvasható

NEM VÁLTOZIK
- normál push be-/kikapcsolás logika
- in-app notification inbox
- push kézbesítés és deep link
- notification preference-ek
- V2.3.10.13 swipe fix
- auth / planner / profile / payments

TELEPÍTÉS
Ha a 10.14-et még nem tetted fel, azt hagyd ki; elég ezt a 10.15-öt felrakni.

Cseréld:
index.html
app.js
styles.css
sw.js

A 053 SQL ugyanaz:
PREFLIGHT_053_PUSH_TEST_RPC_READ_ONLY.sql
053_PLAYER_PUSH_TEST_RPC_PRODUCTION_LOCKDOWN.sql

Elvárt verify:
authenticated_can_execute = false
service_role_can_execute = true

Build:
Player V2.3.10.15
