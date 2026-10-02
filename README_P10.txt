CLUB CONTROL PLAYER V2.3.10.26O-P10

Scope:
- avatar set 52 -> 60
- new: gyűrűsfarkú maki, egér, malac, kacsa, juh, tyúk, T-Rex, axolotl
- same-team avatar reservation in UI + DB guard
- 8x8 sprite atlas; original first 52 decoded pixels preserved
- carries forward requested P8 medical compact/X/neutral-text polish because uploaded repo was P7-based
- notification swipe logic not modified

Deploy frontend files:
app.js
styles.css
sw.js
index.html
icons/avatar-sprite.webp
assets/player-animals.webp

DB deploy order:
1 PRECHECK_PLAYER_AVATAR60_UNIQUE_TEAM_READ_ONLY.sql
2 INSTALL_PLAYER_AVATAR60_UNIQUE_TEAM_V1_SAFE.sql
3 POSTCHECK_PLAYER_AVATAR60_UNIQUE_TEAM_READ_ONLY.sql

P10 artwork refinement: the original 52 avatar cells are unchanged; only indices 52–59 were replaced with the approved lemur/mouse/pig/duck/sheep/chicken/T-Rex/axolotl artwork.
