PLAYER V2.3.10.26F — ONE-WAY SWIPE + HARD STICKY EDGES

Scope only:
1) Notification swipe
- native horizontal scroll remains
- swipe may start only to the left
- rightward CLOSED-state rubber-band is blocked
- under 50%: returns/reveals normal action state
- at >=50% of row width on release: notification is dismissed automatically
- no frame-by-frame JS translate

2) Planner grid
- legacy compact grid geometry is preserved
- Alkalom + Fő remain sticky left
- header remains sticky top
- iOS boundary rubber-band is blocked at matrix edges
- month dividers are preserved

REPLACE ONLY:
- index.html
- app.js
- styles.css
- sw.js

DO NOT REPLACE:
- config.js
- manifest.webmanifest
- icons/
- assets/

After deploy:
- fully close installed Player PWA
- open once in Safari and refresh
- reopen PWA

Physical smoke test:
- notification: right-start swipe does not move
- notification: left swipe <50% does not auto-dismiss
- notification: left swipe >=50% + release dismisses
- grid: left/top boundary does not rubber-band visibly
- grid: horizontal + vertical native scrolling remains smooth
- grid: Alkalom/Fő + header stay pinned
- month labels remain visible
