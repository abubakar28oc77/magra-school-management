# Magra School Management — V105 Finalization Roadmap

## Pilot phase
1. Connect `Magra School Pilot` using a temporary PostgreSQL/Supabase connection.
2. Run migrations and `scripts/pilot_setup.mjs` only on the pilot database.
3. Test authentication, RBAC, student/teacher management, attendance, result, fees, library, notices, documents, reports and portals.
4. Use the Student Management page to edit the synthetic students or upload the school's own CSV.
5. When pilot acceptance is complete, run `scripts/pilot_cleanup.mjs` against the pilot database if the database will be reused for production.

## Student data policy
- The ten synthetic `PILOT-*` students are test records only.
- Production data entry is supported through the normal Student Entry form and bulk CSV import.
- The bulk import accepts up to 500 rows per request and upserts by `student_id`.
- A downloadable CSV template is provided in Student Management.
- Individual student editing remains available after import.

## Production phase
1. Create/choose the production database.
2. Apply schema + migrations 006–035.
3. Do NOT run `database/pilot/pilot_seed.sql` in production.
4. Create the real school admin account and change all temporary passwords.
5. Configure production secrets, CORS, storage and backups.
6. Build the frontend in an environment with dependencies installed.
7. Deploy backend + frontend.
8. Point `magrapalshs.edu.bd` DNS/hosting to the production deployment after final acceptance.
9. Run smoke tests and backup/restore verification.
