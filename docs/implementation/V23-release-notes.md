# V23 Release Notes

## Routine Management
- Added routine list/filter-ready API, create/update/delete endpoints.
- Added time validation and audit logging.
- Added indexes and exact-slot uniqueness migration.
- Added admin routine management UI with class, section, day, time, subject, teacher and room.
- Fixed teacher portal room field to use the canonical `room` column.

## QA
- Static V23 QA script added under `scripts/qa_v23.mjs`.
- Backend syntax and backup/restore shell syntax checks pass.
- Live PostgreSQL integration remains pending where PostgreSQL is unavailable.
