CLUB CONTROL PLAYER V2.3.9.8 — PANEL INITIAL FOCUS
Base: V2.3.9.7 PANEL SYSTEM AUDITED

FULL REPLACEMENT FILES:
- index.html
- app.js
- styles.css
- sw.js
- config.js

Scope only:
- Settings and Notifications dialogs initially focus their static title instead of the close X button.
- The title uses tabindex=-1, so it is not added to normal Tab navigation.
- Close-button focus-visible styling remains available for keyboard navigation.
- PWA cache version bumped.

No SQL required.
No push/inbox/RSVP/profile/settings persistence logic changed.
