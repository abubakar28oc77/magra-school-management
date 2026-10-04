# V11 Release Notes — Portal & Digital Learning Foundation

## Verification
- Backend `node --check backend/src/server.js` passes.
- Static route audit completed.
- V9/V10 migrations retained.
- Full PostgreSQL integration test still requires a configured PostgreSQL instance.
- Full frontend production build requires dependency installation in a normal development environment.

## Added
- Student user linkage.
- Guardian-to-student relationship table.
- Role-scoped `/api/portal/me` endpoint for student, guardian and teacher roles.
- Digital learning content table and CRUD foundation.
- Guardian/student linking endpoints with audit logging.
