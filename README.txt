CLUB CONTROL PLAYER V2.3.10.26O-P3 — MEDICAL DATE + TIME
2026-10-01

GITHUB-ONLY PLAYER HOTFIX
Repo: player_application

Replace only:
- app.js
- styles.css
- sw.js

Do NOT replace config.js, index.html, manifest.webmanifest or icons.
No SQL migration is required.

CHANGE
- Sportorvosi időpont dialog now has separate Dátum and Idő fields.
- Time uses native HH:MM input with 1-minute granularity.
- Save still calls the existing cc_player_medical_appointment_save_v1 RPC with YYYY-MM-DDTHH:MM.
- Existing appointment values are split back into Budapest-local date and time when reopening.
- medical_valid_until is not written.

REGRESSION LOCK
- Notification swipe behavior was not edited.
- RSVP, schedule, push, settings and auth were not edited.
- MGR011 backend contract unchanged.

SMOKE AFTER DEPLOY
1. Profil -> sportorvosi -> Időpont beállítása.
2. Confirm separate Dátum + Idő inputs are visible.
3. Enter e.g. 2026-10-15 and 14:35, save.
4. Reopen: both values must be restored.
5. Verify sportorvosi érvényesség date did not change.
6. Re-test notification swipe on iPhone/Android.
