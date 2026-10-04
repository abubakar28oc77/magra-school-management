# V20 Release Notes

- Completed integration-readiness review across backend, database structure, frontend configuration, notifications, documents, reports, AI, portals and PWA.
- Removed duplicate terminal error middleware so the centralized request-aware error handler is authoritative.
- Added a development-only JWT fallback so local development login does not fail merely because `.env` is absent; production still requires a strong explicit secret.
- Tightened production CORS validation to require explicit HTTPS origins.
- Added V20 test report and repeatable end-to-end checklist.
- Live PostgreSQL and production frontend build remain environment-dependent and are explicitly not marked as certified here.
