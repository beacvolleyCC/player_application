# CC Player TEST – Stage 11: RSVP save reliability (2026-10-28)

## Implemented only on TEST branch

GitHub branch: `test/20261026-isolated-player-mobile`. No changes to LIVE `main` or LIVE Supabase.

A new browser script `rsvp-reliability.js`, loaded after `app.js`, controls the TEST Supabase RSVP persistence wrapper while preserving the existing local demo/legacy behavior.

- Captures previous RSVP status, note, yes/no/unknown name arrays and local saved-state snapshot before optimistic UI.
- Runs writes through a **per-event serialized promise chain**, allowing separate events to save concurrently.
- Superseded edits that are still queued are skipped; a superseded response/error never overrides a newer selection.
- On the **latest** failed write, restores the last successfully acknowledged RSVP state immediately and presents an accessible `role=alert` message.
- No database credentials, Supabase grants, Auth users, or outbound push/email integration changed.
- Added file to the allowlisted static Cloudflare TEST build and the TEST-only offline service worker. Existing PWA core cache version remains aligned with the shared app/style asset tokens, to preserve old regression tests.
- Source `config.js` remains DEMO; only the future Cloudflare build is configured to use TEST Supabase. No Cloudflare deployment has yet been made.

## Automated verification

Node.js VM isolated tests: **7/7 passing**:

1. Success persists selected status.
2. Remote error rolls back immediately even while offline.
3. Fast toggles before first dispatch send only the latest choice.
4. Older successful in-flight write followed by failed new write restores the acknowledged state.
5. Older failed in-flight write never reverses a newer selection.
6. Local DEMO/legacy path performs no Supabase write.
7. Different events may be saved concurrently.

Additionally, all six triggered GitHub Actions passed at commit `4d4f0fde10637437ccfc7a9d649b7487acb66098`:
- Player TEST RSVP save reliability (includes Node VM tests and Cloudflare static bundle build).
- CC Player mobile isolation checks.
- Player match order and protocol QA.
- Men's B seven-team and standings QA.
- Player archived future BB2 fixture regression.
- TEST Player static Pages build.

## Explicit limits

- **No on-device end-to-end RSVP acceptance:** separate TEST `pages.dev` URLs still need a user-hosted Cloudflare project, which can wait for desktop access. GitHub Actions passing does not prove iOS login or real Supabase write success.
- The requested TEST RLS membership date-start check remains unresolved (tracked separately in Club Control Manager issue #81). A direct TEST DB patch was blocked by security controls; never bypass that by broadening grants.
- Do not close issue #31 until a real authenticated TEST Player login verifies an RSVP success, denial rollback, rapid toggles, and same-team/cross-team isolation.

## 11-point release-readiness checklist (future on-device QA)

1. TEST-only host/project visible and distinct from LIVE.
2. TEST Supabase URL present in `dist-test/config.js`.
3. Player login works with OTP without creating unauthorized users.
4. Existing sign-in returns correct TEST team and events.
5. Status `Jövök` persists across reload.
6. Status `Nem jövök` persists across reload.
7. Neutral response persists across reload.
8. Rejected RSVP restores prior display and announces error.
9. Rapid toggles save only final selected state.
10. Cross-team RSVP modification denied.
11. Logout/relogin and offline transition do not retain false confirmed RSVP.

Do not promote to LIVE without independent approval and the usual double QA.
