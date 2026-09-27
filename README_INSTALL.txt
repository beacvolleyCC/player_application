CLUB CONTROL PLAYER — V2.3.10.25

Scope
- Mobile Grid v3 freeze panes: header row + Alkalom + Fő remain fixed.
- One native X/Y matrix scroll surface; Én + player columns scroll horizontally.
- Restores dedicated Fő column; attendance count no longer lives inside Alkalom.
- Event detail dialog no longer opens with the X button auto-selected/focused.
- V2.3.10.24 behavior retained: Motion System v1, slider fixes, fixed court fallback, detail-only Google Maps, calendar export, past calendar event states.

Deployment
Replace the Player frontend files with index.html, app.js, styles.css and sw.js from this package.
No SQL/database migration is included or required.

Production gate
Physically smoke-test iPhone PWA, Android and desktop before treating this candidate as production.
