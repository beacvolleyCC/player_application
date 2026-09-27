PLAYER V2.3.10.26C — OLD COMPACT GRID + NOTIFICATION SWIPE MOTION v1

BASE
- V2.3.10.26B old compact grid stable
- Player config / manifest / icons are NOT included and must NOT be overwritten.

RUNTIME FILES TO REPLACE
- index.html
- app.js
- styles.css
- sw.js

DO NOT REPLACE / DELETE
- config.js
- manifest.webmanifest
- icons/
- any other existing Player repo assets

NOTIFICATION SWIPE MOTION v1
- iOS Mail/Messages-style row swipe actions
- fixed action layer beneath the notification card
- 8px deadzone
- horizontal/vertical direction lock
- direct finger tracking during drag (no transition)
- 80px normal reveal
- rubber-band resistance after reveal
- distance + velocity close/open/full-swipe decision
- full swipe archives automatically
- revealed "Eltüntetés" action can be tapped
- only one notification row may stay open
- outside tap or notification-list scroll closes an open row
- 220ms spring-like snap: cubic-bezier(.22,1,.36,1)

GRID
- unchanged from 26B
- mobile: Alkalom 112px, Fő 34px, Én 86px, players 38px, row 42px
- fixed Alkalom + Fő; sticky header
- green / red RSVP cells retained

IMPORTANT
This package intentionally does not contain config.js or manifest.webmanifest.
Keep the recovered Player versions currently in the repository.
