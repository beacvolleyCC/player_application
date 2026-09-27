CLUB CONTROL PLAYER — V2.3.10.26 FULL REPO PACKAGE

This is the complete current Player frontend package used by this project line.
Runtime files:
- index.html
- app.js
- styles.css
- sw.js

There is no separate config.js, manifest.webmanifest, assets/ or icons/ directory
in the current Player package lineage. The stable V2.3.10.16 checkpoint and all
subsequent Player release packages use these same four runtime files.

INSTALL / GITHUB
1. Replace the four files in the player_application repository with the four files here.
2. Do not delete unrelated repository metadata such as .git, .github or README files if present.
3. Commit and push.
4. After deployment, fully close and reopen the installed PWA / browser tab so the new service worker can activate.

BASELINE
- Built from the retained Player V2.3.10.x line, not from the accidentally overwritten local Git folder.
- Includes the V2.3.10.26 reference-grid changes plus the prior retained Player behavior.
