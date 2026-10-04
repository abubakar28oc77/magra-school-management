# V84 Release Notes — Pilot Execution Preparation

V84 prepares the project for a controlled, non-production pilot. It does **not** connect to the expired BTCL domain or any production database.

## Added
- Synthetic PostgreSQL pilot seed: `database/pilot/pilot_seed.sql`
- Pilot QA script: `scripts/qa_v84.mjs`
- Reusable teacher/student CSV templates retained under `docs/pilot-data/`

## Pilot seed coverage
- Admin, teacher, guardian and student test accounts
- 3 synthetic teachers
- 2 synthetic students in each class 6–10
- Guardian-to-student links
- Academic year, subjects, exam and sample marks
- Attendance
- Assignment + submission
- Fee
- Library book + loan
- Notice

## Safety
- All records are synthetic.
- Pilot accounts use a temporary password and are flagged to change it.
- The seed is explicitly not for production.
- No domain, hosting or external database is contacted by the seed or QA script.

## Not yet done
- No live PostgreSQL connection
- No paid hosting/domain renewal
- Full Vite build remains environment-dependent until npm dependencies are installed successfully
