# V82 Release Notes

## Final production-candidate polish

- Corrected the PWA Login shortcut from `/#login` to the dedicated `/login` route.
- Updated backend health/ready/startup version markers to V82.
- Added `scripts/qa_v82.mjs` for final Login/PWA/public-identity regression checks.
- Preserved the locked public View Page reference sequence 1→2→3→4.
- Preserved school EIIN 114290, logo and building assets.

## Production status

Live PostgreSQL is intentionally not configured in this package. Full Vite production build is not certified because frontend dependencies could not be installed in the working environment within the available timeout. Production deployment remains a separate final handoff step.
