CLUB CONTROL PLAYER V2.3.10.0 — HIDDEN SELF TEST

BASE:
- V2.3.9.9 profile notifications first

INSTALL:
Replace the full Player files:
- index.html
- app.js
- styles.css
- sw.js
- config.js

NO SQL REQUIRED.

HIDDEN QA SELF-TEST:
1. Open Player PWA.
2. Profile -> Settings -> Notifications.
3. Phone notifications must show: "Aktív ezen az eszközön."
4. Tap that status text 5 times quickly (within about 2.4 seconds).
5. A temporary "QA · saját értesítés" block appears.
6. Tap "Saját tesztértesítés".
7. The in-app inbox should update immediately.
8. The phone push is delivered by the existing automatic sender on its next run (up to about 5 minutes).
9. The QA block hides after use or automatically after 90 seconds.

SECURITY / SCOPE:
- No secret is added to the Player frontend.
- Uses the already-installed authenticated cc_player_push_test_v1 RPC.
- No database migration in this build.
- Normal players do not see the QA control unless the hidden 5-tap gesture is performed while push is active.
