# CC Player vNext – isolated branch agreement (2026-10-29)

This branch is an **isolated modular rebuild workspace**, forked from Player TEST commit
`70c2d77f62fd14d56c99b1051897844ff2ea63c2`. Manager equivalent:
`beacvolleyCC/club-control-manager` branch `vnext/20261029-modular-rebuild`.

The legacy/current Player TEST branch and LIVE main stay unchanged. There is no deploy
from this branch and no database mutation or email/push/payment activation.

Finish the shared TEST DB contracts/RLS and separately hosted TEST PWA acceptance first.
Then implement and review modules one at a time. Each module requires double QA,
11-point security/reliability QA, signed-off UX, explicit patch target and rollback.
A completed vNext module is NOT automatically integrated to TEST or LIVE.

Full canonical plan:
https://github.com/beacvolleyCC/club-control-manager/blob/test/20261026-manager-document-intake/docs/architecture/CC_MODULAR_REBUILD_ROADMAP_20261029.md

No user accounts, emails, roster exports, secrets or credentials should be added to GitHub.
