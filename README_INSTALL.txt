CLUB CONTROL PLAYER V2.3.9.4 — IN-APP NOTIFICATIONS V1

Install order:
1. Run PREFLIGHT_049_PLAYER_INAPP_NOTIFICATIONS_READ_ONLY.sql (read-only).
2. If all checks are TRUE, run 049_PLAYER_INAPP_NOTIFICATIONS_V1_SAFE.sql.
3. Replace the five Player files in GitHub: index.html, app.js, styles.css, sw.js, config.js.
4. After deploy/cache refresh, run the controlled QA function only when instructed.

The 049 migration is additive. Core Player/event/availability rows are not modified.
