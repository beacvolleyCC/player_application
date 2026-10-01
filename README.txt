CLUB CONTROL PLAYER V2.3.10.26O-P4 — MEDICAL DATE/TIME iOS GRID FIX
2026-10-01

GITHUB-ONLY PLAYER HOTFIX
Repo: player_application

Replace only:
- styles.css
- sw.js

app.js is unchanged from P3.
Do NOT replace config.js, index.html, manifest.webmanifest or icons.
No SQL migration is required.

FIX
- iOS native date input could overflow its CSS grid track and overlap the time field.
- Date + time now use two shrink-safe minmax(0,1fr) tracks.
- Both native controls are explicitly constrained to their own column.
- Dialog behavior, date/time save format and MGR011 backend are unchanged.

REGRESSION LOCK
- Notification swipe unchanged.
- RSVP/schedule/push/settings/auth unchanged.
- medical_valid_until unchanged.
