# Magra School Management — Pilot Start Here

This package is **pilot-ready**, but production deployment is intentionally blocked until the real disposable Pilot PostgreSQL/Supabase database and browser acceptance are completed.

## On Windows
1. Install Node.js LTS.
2. Extract this ZIP.
3. Copy `backend/.env.pilot.example` to `backend/.env`.
4. Fill only the temporary Pilot values:
   - `DATABASE_URL`
   - `JWT_SECRET` (32+ random characters)
   - `CORS_ORIGIN`
   - `PILOT_DB_SSL=true` when required by the provider.
5. Open PowerShell in the project root and run:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\scripts\pilot_windows_preflight.ps1
```

## Database order
Apply `database/schema.sql`, then migrations `006` through `037` in numeric order, then `database/pilot/pilot_seed.sql`.

Then run:

```powershell
node scripts/preflight_pilot.mjs
node scripts/pilot_verify.mjs
```

## Important
- Pilot data is synthetic and disposable.
- Do not use the future production database for this test.
- Do not renew/connect `magrapalshs.edu.bd` production hosting yet.
- Do not import real school records until Pilot UI acceptance passes.
- The production gate requires a successful frontend `npm run build`, live Pilot verification, browser/mobile acceptance, and backup/restore testing.
