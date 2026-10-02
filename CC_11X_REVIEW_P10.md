# Player V2.3.10.26O-P10 — 11× QA

1. Product — PASS static: 60 avatars; same-team duplicate prevention.
2. UX — PASS static: occupied avatars disabled; current own avatar remains selectable.
3. UI — PASS static: 8×8 monochrome sprite; original 52 preserved; new 8 follow same black/white head-icon language.
4. Frontend/PWA — PASS static: app.js syntax; service-worker cache bumped; sprite cache URL bumped.
5. Backend/API — PASS by source review: new team-scoped directory RPC is additive; legacy directory remains fallback.
6. DB/data integrity — PASS by source review: install aborts on pre-existing same-team duplicates; trigger prevents future conflicts.
7. Architecture — PASS: player_settings.avatar_id remains canonical; no parallel avatar store.
8. Security — PASS by source review: authenticated directory is SECURITY DEFINER and exposes only playerId/avatarId for overlapping active teams; no secrets.
9. QA/accessibility — PASS static: 60 unique IDs/indexes 0..59; occupied buttons are disabled + aria-disabled/title.
10. DevOps — PASS: PRECHECK/INSTALL/POSTCHECK provided; frontend deploy is explicit.
11. Motion/interaction — PASS static: FINAL notification swipe code not edited; avatar click saves immediately and rolls back on conflict.

Static checks:
- JS syntax: PASS
- CSS braces: PASS
- duplicate HTML ids: 0
- sprite: 768×768, 8×8 atlas
- original avatar pixels 0..51: preserved
- live authenticated smoke: PENDING

## P10 artwork-specific verification
- Original avatar indices 0–51: pixel-identical to the uploaded 52-avatar source after decode.
- New indices 52–59: approved monochrome artwork integrated into the 8×8 atlas.
- Player asset and legacy `assets/player-animals.webp` use the same atlas.
- Team-unique avatar RPC/trigger logic unchanged from P9.
