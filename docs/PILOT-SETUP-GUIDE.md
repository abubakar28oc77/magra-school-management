# Pilot Setup Guide — V88

This guide is for the temporary school-management pilot only. Do **not** use the expired school domain or a future production database yet.

## Recommended order
1. Create one temporary PostgreSQL database on Supabase Free or Neon Free.
2. Copy its PostgreSQL connection string into `backend/.env` using `backend/.env.pilot.example` as the template.
3. Install backend dependencies: `cd backend` then `npm install`.
4. Return to project root and run `node scripts/pilot_setup.mjs`.
5. Run `node scripts/pilot_verify.mjs`.
6. Start the backend and frontend locally.
7. Test the pilot accounts and workflows in `docs/PILOT-TEST-PLAN.md`.

## Pilot accounts
All synthetic pilot accounts start with the temporary password:

`Pilot@12345`

Every pilot account is flagged to require a password change. Change these passwords immediately during testing.

Pilot account families:
- `pilot-admin`
- `pilot-teacher-01` to `pilot-teacher-03`
- `pilot-guardian-01` to `pilot-guardian-02`
- `pilot-student-06-01` through `pilot-student-10-02`

## Safety rules
- Never paste real production passwords into this guide.
- Never point `DATABASE_URL` at the future production database.
- Do not upload real student birth registration numbers, addresses, phone numbers, medical data, or other sensitive records during the first smoke test.
- Keep the pilot database separate from production.
- Take an export before changing the pilot dataset.

## Pilot completion
When every requested workflow passes with pilot data, record the failures/changes and only then plan the paid production PostgreSQL, hosting and domain renewal.
