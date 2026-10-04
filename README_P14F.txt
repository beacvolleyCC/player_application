CLUB CONTROL PLAYER V2.3.10.26O-P14F
====================================
Base: P14E + existing P14D/P14C/P14B work retained.

CHANGES
- Calendar semantic colors: training=BEAC yellow, home match=green, away match=blue.
  Arbitrary event color no longer overrides calendar type colors.
- Training/event views show the assigned team coach monogram(s) next to headcount.
  Coach data comes from MGR016 finance/settings response when available.
- Player Díjak configuration can come from Manager/MGR016:
  pass/tagdíj amount, coach fee, competition-license fee, webshop URL,
  coach payment recipient/account/text, Player info.
- Landscape safe-area / Dynamic Island handling refined.
- P14E dark bottom-nav + sportorvosi date/time frame fixes retained.
- Existing team-logo/dark-logo mapping retained.
- Existing old app icons are NOT included or replaced.
- Android splash stays full BEAC yellow via manifest; current repo icon remains in the center.

REPLACE IN PLAYER REPO
- app.js
- index.html
- styles.css
- sw.js
- manifest.webmanifest
- assets/team-logos/ (replace/add the folder)

DO NOT REPLACE
- icons/  (keep the currently approved old Player icons)
- config.js

BACKEND
- P14F itself remains backward-safe with fallback fee values.
- Dynamic finance/coach settings require MGR016.

CACHE
Installed PWA may need a full close/reopen. If Android keeps old PWA metadata,
remove/reinstall only if necessary; the icon files themselves are intentionally unchanged.
