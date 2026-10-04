# Magra School Management — V117 Pilot Acceptance Runbook

## Purpose
This runbook is the controlled path from the release candidate to a disposable pilot database. It deliberately separates synthetic pilot data from future production data.

## 1. Prepare a temporary PostgreSQL/Supabase project
Use a fresh disposable database. Do not use the future production database.

Set `backend/.env` from `.env.pilot.example` and provide:
- `DATABASE_URL`
- `JWT_SECRET` (32+ random characters)
- `CORS_ORIGIN`
- `PILOT_DB_SSL=true` when the provider requires SSL
- `NODE_ENV=development`

## 2. Apply database
Apply `database/schema.sql`, then all migrations in `database/migrations/` in numeric order.

## 3. Seed synthetic pilot data
Run `database/pilot/pilot_seed.sql`.

The seed is synthetic and contains no intended production records. Pilot accounts use the temporary password `Pilot@12345` and are marked to change password.

## 4. Verify pilot data
From the project root:

```bash
node scripts/preflight_pilot.mjs
node scripts/pilot_verify.mjs
```

The verification must pass before UI acceptance.

## 5. Start the application
Backend:

```bash
cd backend
npm ci
npm start
```

Frontend:

```bash
cd frontend
npm ci
npm run build
npm run preview
```

## 6. Mandatory UI acceptance
Test at minimum:
- admin login/logout/password change
- student add/edit/search/filter/import/export
- teacher add/edit/import/export
- staff add/edit/import/export
- attendance entry and paginated roster
- exam/marks/result workflow
- fees/payment workflow
- library issue/return
- notice/notification workflow
- guardian/student portal access
- public homepage
- public student statistics
- public contact synchronization
- emergency service links
- education clubs
- print/document pages

## 7. Negative/security tests
Confirm:
- inactive user cannot log in
- non-admin cannot perform admin-only actions
- malformed/oversized JSON is rejected
- login rate limiting works
- ordinary API rate limiting works
- external links use safe target attributes
- destructive restore is refused in production

## 8. Data-quality tests
Use a disposable pilot record to verify:
- duplicate Student ID updates rather than creating a duplicate
- duplicate Teacher Employee ID updates rather than creating a duplicate
- duplicate Staff Employee ID updates rather than creating a duplicate
- invalid CSV rows are rejected with useful errors
- inactive people disappear from public contact where appropriate
- changing the assigned Head Teacher/Assistant Head/ICT/Office Assistant updates public contact without hardcoding

## 9. Backup/restore
Create a pilot backup, verify its `.sha256`, restore only into a disposable pilot database, and run `pilot_verify.mjs` again.

Never use `scripts/restore.sh` against production. The script deliberately refuses `NODE_ENV=production` and requires `PILOT_RESTORE_CONFIRM=YES`.

## 10. Production gate
Production is permitted only after:
- static QA passes
- security audit passes
- frontend production build passes
- live pilot verification passes
- browser/mobile UI acceptance passes
- backup/restore test passes
- real school data import is validated on a separate production preflight

No synthetic pilot account or pilot record should be carried into production unless explicitly converted by the administrator.
