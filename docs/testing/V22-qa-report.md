# V22 QA Report

## Scope
Security/session hardening and functional static QA for the Magra School Management platform.

## Completed
- Added `auth_token_version` to users and migration 017.
- JWTs now carry the token version.
- Protected requests reject stale tokens after password, role, or account-status changes.
- Password reset/change invalidates existing sessions.
- Verified notification admin user query uses the roles table.
- Retained production environment validation, request IDs, rate limits, health/readiness checks, and graceful shutdown.

## Static QA
Run:

```bash
node scripts/qa_v22.mjs
node --check backend/src/server.js
node --check backend/src/security.js
bash -n scripts/backup.sh
bash -n scripts/restore.sh
```

## Environment limitation
This workspace does not provide a PostgreSQL server/client, so live migration, database integration, and end-to-end HTTP tests against PostgreSQL are not certified here. The release must be smoke-tested against the actual staging PostgreSQL instance before production deployment.
