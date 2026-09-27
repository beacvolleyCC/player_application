PLAYER V2.3.10.26A — CONFIG RECOVERY

ROOT CAUSE
The Player GitHub repository had Manager files in two critical paths:
- config.js contained window.CC_MANAGER_CONFIG instead of window.CLUB_CONTROL_CONFIG
- manifest.webmanifest identified the app as Club Control Manager

This prevents the Player app from enabling the Supabase Player runtime and can leave demo/default team data visible.

DEPLOY
Overwrite ONLY these three files in beacvolleyCC/player_application:
- config.js
- manifest.webmanifest
- sw.js

Do NOT replace index.html/app.js/styles.css for this recovery step.
Do NOT delete assets/ or icons/.

After GitHub Pages deploy finishes:
1. Fully close the installed Player PWA on iPhone.
2. Open the website once in Safari and refresh.
3. Re-open the installed PWA.
4. If it still shows stale content, remove only the installed Home Screen PWA and add it again from Safari. Account/data remain in Supabase.

Expected after recovery:
- Supabase Player login/session initializes
- correct linked team is loaded by cc_player_bootstrap
- player names return
- existing data are unchanged
