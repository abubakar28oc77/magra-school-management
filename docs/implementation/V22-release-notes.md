# V22 Release Notes

- Session invalidation via per-user token versioning.
- Password changes and admin password resets revoke existing sessions.
- User role/status changes revoke existing sessions.
- Added migration `017_session_invalidation.sql`.
- Added repeatable static QA script `scripts/qa_v22.mjs`.
- Added V22 QA report.
