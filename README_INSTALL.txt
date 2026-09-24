CLUB CONTROL PLAYER V2.3.9.2
ACCOUNT QUICK MENU + NOTIFICATION SHELL

BASE:
- Player V2.3.9.1 push + UI
- live lineage: HEAD 74c724c / pipa2

SCOPE:
- top-right avatar opens quick menu
- menu order: Ertesitesek -> Beallitasok -> Profil
- dark/theme quick button removed from header
- theme remains in Settings > Megjelenes
- Profile keeps its Settings entry
- Profile gains an Ertesitesek entry
- notification inbox empty-state shell added
- unread badge shell added; hidden when count = 0
- production "Teszt ertesites" button removed
- push subscription/send receiver logic preserved
- cache bust bumped to V2.3.9.2

IMPORTANT:
This build does NOT yet add player_notifications backend persistence.
The notification center intentionally shows the real zero/empty state until the backend is added.
No database migration is required for V2.3.9.2.

FULL REPLACEMENT FILES:
- index.html
- app.js
- styles.css
- sw.js
- config.js

DEPLOY:
Replace the five files completely in the Player GitHub repository, then commit/push.
