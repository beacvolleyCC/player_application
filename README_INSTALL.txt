PLAYER V2.3.10.3

Replace these five files completely in the Player deployment:
- index.html
- app.js
- styles.css
- sw.js
- config.js

No SQL is required.
After deployment, fully close the installed PWA and reopen it so the new service-worker cache can take over.

QA target:
1. Generate 3 self-test notifications using the existing hidden QA trigger.
2. Open/read them.
3. Swipe each left to dismiss.
4. All three must disappear; after the final one, only then should "Minden rendben" appear.
