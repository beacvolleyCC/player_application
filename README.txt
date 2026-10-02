CLUB CONTROL PLAYER V2.3.10.26O-P7 — MEDICAL DATE/TIME FRAME RESTORE

Base: P6 medical iOS containment.

CHANGED
- styles.css: restores the visible rounded border/frame around the Sportorvosi date and time fields.
- sw.js: cache bump only.

UNCHANGED / LOCKED
- app.js is byte-identical to P6.
- Native iOS date/time picker behavior is unchanged.
- P6 width containment remains active.
- FINAL notification swipe V2.3.10.26O is untouched.
- Canonical medical field remains player_private.medical_valid_until.

INSTALL
Replace only: app.js, styles.css, sw.js.
(Keeping app.js identical is intentional.)
