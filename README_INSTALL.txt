CLUB CONTROL PLAYER V2.3.9.7 — PANEL SYSTEM AUDITED

BASE: V2.3.9.6
SCOPE:
- Settings and Notifications now use one canonical modal geometry.
- Same top position, width, close-button coordinates and scroll model.
- Settings visual hierarchy normalized.
- No Player business logic changes.
- No Supabase / push / inbox / RSVP / payment / avatar logic changes.

FULL REPLACEMENT FILES:
- index.html
- app.js
- styles.css
- sw.js
- config.js

NO SQL REQUIRED.

IMPORTANT:
Replace the five files completely. Do not manually patch snippets.
After deploy, fully close and reopen the installed PWA so the new service worker/cache can activate.
