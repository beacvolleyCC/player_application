CLUB CONTROL PLAYER V2.3.10.26O-P7 — MEDICAL DATE/TIME FRAME RESTORE

BASE
- Built directly from the user-uploaded P5 Medical Modal UI package.
- P6 iOS date/time containment is applied on top of that exact baseline.
- P7 restores the two visible rounded date/time frames.

CHANGED
- styles.css: P6 hard containment + P7 visual frame restore.
- sw.js: cache key bump only.

UNCHANGED / LOCKED
- app.js is byte-identical to the uploaded P5 package.
- Native iOS date/time picker behavior is unchanged.
- FINAL notification swipe V2.3.10.26O is untouched.
- Canonical medical field remains player_private.medical_valid_until.

INSTALL
Replace only: app.js, styles.css, sw.js.
Keeping app.js identical is intentional.
