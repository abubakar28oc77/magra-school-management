# V21 Release Notes — Full-System QA Hardening

- Authentication now re-checks the active user and current database role on every protected request, preventing stale JWT role access after deactivation/role changes.
- Added a global API rate limiter in addition to the login limiter.
- Hardened Bearer token parsing and JSON request parsing.
- Added PostgreSQL pool limits/timeouts and pool error logging.
- Added graceful SIGINT/SIGTERM shutdown with database pool cleanup.
- Health/readiness endpoints now report V21.
- Backup script now uses restrictive `umask 077`.

## QA limitation
Live PostgreSQL and browser build execution remain environment-dependent. Static checks are included in the V21 test report.
