CLUB CONTROL PLAYER — V2.3.10.24
MOBILE GRID V2 + EVENT CARD / COURT / GESTURE PATCH

BASELINE
- Direct base: Player V2.3.10.23.
- Retains Motion System v1, calendar export, away navigation detail view, push/in-app notifications, attendance, fees, auth and Supabase business logic.
- No SQL/schema change.

INCLUDED
1) Mobile Grid v2
- Menetrend grid now has one sticky left column only: Alkalom.
- Separate sticky Fő column removed from the grid structure.
- Headcount is shown inside the event cell.
- Own player column is first after Alkalom and labelled Én.
- Remaining player columns use stable fixed widths.
- One native #matrixScroll surface owns both X and Y scrolling.
- Month separators no longer participate in sticky geometry.
- Archived grid event labels are inert/non-clickable when past rows are explicitly shown.

2) Pull-to-refresh isolation
- Pull-to-refresh never arms from the Menetrend grid surface.
- Grid pan/scroll gestures remain owned by the matrix.

3) Event card cleanup
- Google Maps link removed from normal event cards and normal Menetrend rows.
- Google Maps route remains in the shared event detail dialog for away matches.
- Headcount is always a stable right-side element for training/home/away cards.
- Away address remains visible in compact cards.

4) Weekly BEAC court rules
Fixed weekly local court allocation now takes priority over stale/missing event court metadata:
- BEAC Női I.: Tuesday 1. pálya; Friday 3. pálya
- BEAC Női II.: Tuesday 2. pálya; Friday 1. pálya
- BEAC Férfi: Monday 3. pálya; Wednesday 2. pálya
- Away matches never inherit Bogdánfy court allocation.
- Team detection also falls back to the actually rendered Player header team name.

5) Attendance tap transition
- Drag behavior from V2.3.10.23 is retained.
- Tap still advances at most one state.
- During a tap snap, slider/card visual state is updated immediately before persistence.
- This removes the first Jövök -> Nincs jelzés green/white flash.
- Tap snap remains fast and non-overshooting.

6) Calendar past events
- In Calendar mode, the default upcoming period keeps historical events available in past dates/months.
- Past items are inert/non-clickable.
- Past trainings use subdued gray treatment.
- Past matches can show set result when the backend provides a set-score/result field.
- Past match win = pale green; loss = pale red.
- No result is invented when the backend does not supply set result data.

RETAINED
- Apple/iPhone + Google Calendar one-time ICS export.
- Europe/Budapest ICS timezone.
- Motion System v1 and prefers-reduced-motion.
- V2.3.10.16 native notification swipe/iOS red-tail corrections.
- V2.3.10.22 matrix native-touch foundation.
- V2.3.10.23 adjacent tap/flick slider behavior.

INSTALL
Replace only:
- index.html
- app.js
- styles.css
- sw.js

Do NOT replace production config.js.
NO SQL REQUIRED.
Do not rerun migrations 047–053, MGR001 or MGR002.

PHYSICAL QA BEFORE PRODUCTION
- iPhone PWA: grid pan X/Y from header, event rows and player cells.
- Confirm no pull-to-refresh appears while touching/panning grid.
- Confirm Alkalom remains stable and player widths do not collapse at different scroll positions.
- Slider: first Jövök -> Nincs jelzés tap has no flash/jump.
- Training cards display correct fixed weekly court by team/day.
- Away normal card has address + headcount, but no Maps link.
- Away detail dialog still opens Google Maps route.
- Calendar: past training inert/gray; past match inert and result-colored only if result data exists.
