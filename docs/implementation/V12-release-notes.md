# V12 Release Notes — Portals & Digital Learning UI

## Added
- Student portal UI with profile, attendance, finance and library summary.
- Guardian portal UI with linked students and attendance summary.
- Teacher/Head Teacher portal UI with profile and routine.
- Login now routes portal roles to `/portal` and admin roles to `/admin`.
- Admin Digital Learning UI for creating/publishing notes, PDFs, videos, lectures and links.
- Responsive mobile-first portal styling.

## Verification
- `node --check backend/src/server.js` passed.
- Migration structure reviewed for V6–V11 dependencies.
- Frontend production build could not be certified in this environment because npm dependency installation timed out; no node_modules were available.

## Not production-certified yet
- Real PostgreSQL integration test
- Browser E2E test
- Email/SMS delivery
- Production deployment
