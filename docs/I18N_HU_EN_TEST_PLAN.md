# Player HU/EN localization — TEST only

Status: audit in progress; not deployed.

Verified: index.html contains disabled English option; app.js contains Hungarian dynamic strings and a saved language setting; statistics.js has Hungarian labels; sw.js displays server-provided push title/body and has Hungarian fallback; manifest.webmanifest is Hungarian.

TEST Supabase project: szzoubvhlwnojtzqjebc. player_settings.language already exists. player_notifications and player_push_outbox store pre-rendered title/body; these require recipient-language-aware templates at send time. Historical inbox needs template identifiers and parameters to render in selected language.

Acceptance: full UI strings including accessibility, error messages and statistics; locale-specific dates and plurals; persisted language; seven notification preferences plus medical and test types; per-recipient server-side push and email localization; HU/EN regression tests and TEST E2E. Do not change LIVE or enable English before completion.
