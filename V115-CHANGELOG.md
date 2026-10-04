# V115 — Scale & Operational Hardening

## Purpose
V115 is the next final-candidate hardening pass for Magra School Management ERP. It is designed for the current ~600 students and future growth without forcing the public or administrative UI to load unbounded datasets.

## Changes
- Updated backend health/readiness and startup version to V115.
- Added migration 037 with composite indexes for student public statistics, attendance roster, marks, fees, fee payments and audit-log browsing.
- Added optional server-side pagination to `/api/attendance/roster` while preserving the legacy array response when pagination parameters are omitted.
- Preserved Student, Teacher and Staff bulk import/update workflows and dynamic public contact architecture.
- Preserved dynamic public statistics, clubs, emergency services and public contact roles.

## Acceptance boundary
Live Supabase/PostgreSQL connectivity is intentionally not claimed here. V115 is ready for the next pilot acceptance pass once the project's real connection settings are supplied.
