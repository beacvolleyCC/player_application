CLUB CONTROL PLAYER — V2.3.10.26
REFERENCE GRID PARITY

BASELINE
- V2.3.10.25 Freeze Pane Grid v3

CHANGES
- Player Menetrend / Rács resized to the approved compact reference:
  Alkalom 108 px, Fő 44 px, Én 82 px, player columns 52 px,
  header 48 px, event rows 54 px.
- Alkalom + Fő remain frozen on the left.
- Header remains frozen on top.
- Removed animal avatars and event icons ONLY from the dense grid to preserve
  the reference density. Avatars remain available elsewhere in Player.
- Restored green background for Jövök cells and red background for Nem jövök.
- Neutral/no-answer cells remain white/card background.
- Own column uses the same neutral header styling as the reference; the Én
  label and three-way control identify it.

UNCHANGED
- RSVP business logic and slider behavior
- event details / Maps detail-only behavior
- calendar export
- court fallback rules
- Motion System v1
- past-event calendar behavior
- Supabase / auth / push / notification business logic

DEPLOY
Replace the Player frontend files with the files in this package.
Close and reopen the installed PWA after deployment so the V2.3.10.26 service
worker cache is activated.
