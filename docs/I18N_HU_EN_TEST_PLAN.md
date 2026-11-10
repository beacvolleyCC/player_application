# Club Control Player HU/EN — TEST-only handover

## Scope
- Hungarian remains unchanged as the canonical data and UI source language.
- British English (`en-GB`) is available through the Player language selector.
- Player language is saved to `player_settings.language` and also cached locally.
- Login, basic navigation, profile, settings, training attendance, fixture lists, league standings, statistics, match reports, accessible labels, prompts and most UI error states use the same translation catalogue.
- Dynamic labels (attendance totals, sets, months, dates, composite rows) and live DOM updates are translated on the client. Original player/team identifiers are not rewritten.
- Displayed dates and payment amounts use locale-aware formatting in English.
- The existing `i18n.js` and `i18n-static.js` source labels are deliberately Hungarian; translation occurs only for English.

## TEST isolation
- Branch: `feat/player-i18n-en-test-20261110`
- Backend: TEST Supabase `szzoubvhlwnojtzqjebc`, never LIVE `snqsxlyhontaepembaic`.
- In this branch only, `config.js` has no legacy API URL and `PUSH_ENABLED: false`. This is intentional while server-side multilingual notifications remain out of scope.
- IMPORTANT: **Never merge this TEST config.js to LIVE**. When the bilingual frontend is eventually approved for production, keep the existing LIVE config and deploy only the reviewed frontend changes.

## Quality assurance
- `node --check` validates all Player JS entry points.
- `node --test tests/i18n.test.js tests/player-i18n-ui.test.cjs tests/player-i18n-coverage.test.cjs` checks dictionaries, en-GB, dynamic counts, DOM language switching, reversal to Hungarian, accessible attributes, isolated TEST config and source-level translation coverage.
- Existing match, standings, competition, statistics and match-report regression tests also run on the same feature branch.
- GitHub Actions workflow: `.github/workflows/player-i18n-test.yml` — tests/build only, **never deploys to LIVE**.
- The source-coverage audit ignores proper names, venues and diagnostic-code fragments, which are intentionally not translated.
- These automated tests do not replace manual in-browser checks for every state.

## Cloudflare TEST preview (prepared, not published)
- Intended TEST Pages project: `cc-player-test-beac`.
- Source branch: `feat/player-i18n-en-test-20261110`.
- Build command: `node scripts/build-cloudflare-test.cjs`.
- Output directory: `dist-test`.
- The build script validates TEST-only config and copies the static PWA and language assets. It does not publish the site.
- No TEST preview URL or successful Cloudflare deployment is claimed until externally verified.

## Manual acceptance checklist
1. Open the TEST Player from an account that exists only in TEST, sign in and change language to English.
2. Verify the dashboard, training cards, all attendance states, roster, filters and calendar/grid.
3. Verify matches, standings, league statistics, protocol tables and staff labels.
4. Verify profile details, payment status/money/date formatting, settings and prompts.
5. Change attendance or receive an update, and check newly inserted text and aria labels remain English.
6. Reload and sign back in; verify per-player English preference persists, then switch to Hungarian and confirm all original Hungarian UI returns.
7. Confirm no network calls reach the LIVE Supabase project or legacy LIVE Apps Script endpoints.

## Separate, deferred area
Notification inbox titles/bodies from the server and Web Push payloads require recipient-language-aware server templates and are **not** included in this frontend-only pass. Do not describe the whole bilingual notification system as finished.
