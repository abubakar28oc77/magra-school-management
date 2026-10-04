# V75 Release Notes

## Production-readiness hardening
- Added `scripts/preflight_v75.mjs` for deterministic pre-deployment checks.
- Verified production environment validation requires `DATABASE_URL`, a strong 32+ character `JWT_SECRET`, and explicit HTTPS `CORS_ORIGIN` values.
- Verified the frontend has a Vite production build script.
- Verified `/ready` performs a PostgreSQL `SELECT 1` readiness check.
- Verified the document-integrity migration is present and migration filenames are unique.
- Added a clear distinction between code-level readiness and environment-level certification.

## Important certification status
- Live PostgreSQL: **not connected/certified in this environment**.
- Full Vite production build: **not certified** because dependency installation timed out in this environment.
- Production deployment/domain: **not performed**.
- Final public View Page remains locked to the approved 1 → 2 → 3 → 4 reference structure.
