PLAYER V2.3.10.26G — MICRO DAMPING + SOFTER NOTIFICATION DISMISS

Scope only:
1) Notification swipe tuning
- native one-way swipe remains: CLOSED state can only start to the left
- compact reveal: 68 px action width
- lighter/faster settle after release
- auto-dismiss threshold moved from 50% to ~35% of row width
- no need to drag the row across the full width
- dismissal now finishes as: native slide -> short fade -> row collapse
- no frame-by-frame JS translate drag

2) Planner grid micro damping
- current native X/Y scrolling remains
- Alkalom + Fő remain sticky left
- header remains sticky top
- legacy compact geometry and month dividers are unchanged
- hard edge lock is softened with ~3 px micro edge allowance before the boundary guard engages
- no snap/custom drag added

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
- notification: right-start swipe does not move the row
- notification: short left swipe reveals the compact Eltüntetés action without feeling sticky
- notification: ~35% left swipe + release dismisses automatically
- notification: dismissal slides/fades/collapses instead of jumping out
- grid: left/top edge has only a very faint give, then holds
- grid: horizontal + vertical native scrolling remains smooth
- grid: Alkalom/Fő + header stay pinned
- month labels remain visible
