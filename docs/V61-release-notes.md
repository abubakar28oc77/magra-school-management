# V61 — Reference-driven navigation shell

Changes:
- Added the first two user-supplied reference screenshots to the project in V60 and used them as the initial navigation/header visual reference.
- Reworked the public header into a three-level shell: institutional topbar, school identity row, and green navigation band.
- Wired `publicNavConfig.js` into the actual Header so menu items with children now render dropdowns on desktop and expandable sections on mobile.
- Kept the final page section order intentionally adjustable until all 7 reference screenshots are received.
- Preserved school identity data: EIIN 114290 and school email.
- Updated backend health/version marker to V61.

Validation:
- Static reference/navigation QA to be run with `qa_v61.mjs`.
