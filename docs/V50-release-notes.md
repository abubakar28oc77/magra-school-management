# V50 Release Notes

## Public View completion pass
- Added public School Life search across published content.
- Added category filters for institution, events, sports, achievements, scholarships, facilities, transport, hostel, clubs and library information.
- Added responsive public Contact & Information section using the approved school identity details.
- Preserved photo gallery lightbox and public content API separation.
- Added mobile-responsive filter/contact styling.

## Verification
- `node scripts/qa_v50.mjs` — PASS 10/10
- `node --check backend/src/server.js` — PASS
- `node --check scripts/qa_v50.mjs` — PASS
- `bash -n scripts/backup.sh` — PASS
- `bash -n scripts/restore.sh` — PASS
- PostgreSQL integration and frontend production build remain environment-dependent and are not claimed here.
