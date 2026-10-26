# CC Player TEST — BB2 Nov 3 Corvinus grey fixture QA (2026-10-26)

LIVE SELECT-only findings: `BEAC II. – Corvinus`, 2026-11-03 19:30 Europe/Budapest, event `35e9bc22-657f-4249-82b3-7a1f584ffd2c` has **archived** status. Its 12 RSVP rows remain: 10 going, 1 not-going, 1 unknown. Don't delete or silently transfer them.

Separate `Corvinus – BEAC II.` 2026-11-25 19:30 Europe/Budapest is active, event `f3555803-6c59-48c2-9847-d7fa904c31e7`, 0 RSVPs. Its canonical source is Women Budapest II/B `brsz:2026/27:959:866:959:1`; return match Feb 16, 2027 distinct `brsz:2026/27:959:959:866:1`.

Cause: `cc_player_bootstrap` explicitly returns archived=true for status archived; Player isPast() correctly closes it, yet 14/30-day home date filters can show future archived fixtures grey.

TEST-only behavior: hide future archived matches in current/home/calendar/upcoming/grid; retain under explicit archive filter with `Archivált időpont` label and all original RSVP data untouched. Prevent misleading auto-absence label on future retired match. Never mix Women II/B with II/A. No LIVE SQL writes/merge/deploy.

This TEST patch is UI-only until staging backend/bootstrap and iOS PWA acceptance, then separate reviewed LIVE patch if approved.
