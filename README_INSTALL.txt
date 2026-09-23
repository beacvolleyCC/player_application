CLUB CONTROL PLAYER PUSH V2.3.9.0
LIVE-HEAD FULL REPLACEMENT
=================================

AUTHORITATIVE BASELINE
----------------------
Git HEAD: 74c724c7765f36864971aa57c4a7d9322c881b3c
Commit:   pipa2
Branch:   main

This package was rebuilt/verified against the exact Player repository HEAD
recovered from the uploaded .git directory.

REPLACE THESE FILES COMPLETELY
------------------------------
index.html
app.js
styles.css
sw.js
config.js
icons/avatar-sprite.webp

Do not paste partial patches.
Do not change manifest.webmanifest or other repository files in this step.

BACKEND STATE EXPECTED BEFORE THIS DEPLOY
-----------------------------------------
047 push SQL installed and verified.
cc_push_health_v1() => ok:true.
Supabase Edge Function cc-push deployed.
Verify JWT = OFF.
Required Edge Function secrets configured.
cc-push manual test => HTTP 200 / ok:true.

AFTER GITHUB DEPLOY
-------------------
1. Wait for GitHub Pages deployment to finish.
2. Open the installed Player PWA.
3. Profile -> Settings -> Telefonos értesítések.
4. Enable notifications on one test device.
5. Run a test push before enabling automatic cron scheduling.

IMPORTANT
---------
The VAPID public key in config.js is public by design.
No private VAPID key, cron secret, Supabase secret/service-role key is included.
