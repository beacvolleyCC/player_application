CLUB CONTROL PLAYER V2.3.10.26O-P6
2026-10-01

GITHUB-ONLY PLAYER HOTFIX
Repo: player_application

Replace only:
- app.js
- styles.css
- sw.js

Do NOT replace config.js, index.html, manifest.webmanifest or icons.
No SQL migration is required.

FIXES
- Sportorvosi lejár + expiry date + Időpont beállítása stay on one line.
- Időpont beállítása is narrower on mobile.
- Date and time inputs have a complete visible frame on iOS, including the right edge.
- Save is a full-width bordered Settings-style button, centered.
- Existing appointment still shows Delete + Save 50/50 with a gap.
- Settings “Adatok újratöltése” no longer shows the leading arrow icon.

REGRESSION LOCK
- Notification swipe unchanged.
- RSVP/schedule/push/auth unchanged.
- medical_valid_until unchanged.
- MGR011 backend/RPC unchanged.
