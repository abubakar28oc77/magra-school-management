# V21 QA Report

## Passed
- `node --check backend/src/server.js`
- `node --check backend/src/security.js`
- Shell syntax checks for backup/restore scripts
- No duplicate Express route declarations detected by static scan
- Protected API routes use the central `auth` middleware before role checks
- JWT role is refreshed from the database for each protected request
- Inactive users are rejected even when they possess an unexpired JWT
- API-wide rate limiting is enabled; login has a stricter dedicated limiter
- Health/readiness endpoints are unauthenticated and return V21
- ZIP integrity check

## Environment limitation
The current build environment does not provide a PostgreSQL server/client, and the packaged frontend has no installed dependency tree. Therefore live migration/API/browser E2E certification is not claimed.
