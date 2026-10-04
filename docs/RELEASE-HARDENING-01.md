# Magra School Management — Release Hardening 01

This package keeps the **V115 application/migration version** and adds a release-engineering hardening layer before live pilot deployment.

## What changed

1. **Destructive restore guard**
   - `scripts/restore.sh` refuses `NODE_ENV=production`.
   - It also requires `PILOT_RESTORE_CONFIRM=YES`.
   - Backup SHA-256 verification remains mandatory when the checksum file exists.

2. **Pilot preflight**
   - `scripts/preflight_pilot.mjs` checks for a real pilot `DATABASE_URL`, explicit SSL mode, pilot seed/verification files, and restore safeguards.

3. **Production gate remains explicit**
   - No production deployment is considered complete until pilot DB migration, functional acceptance, backup/restore, browser/mobile acceptance, HTTPS/domain and final backup policy all pass.

## Recommended pilot sequence

```bash
export NODE_ENV=development
export DATABASE_URL='YOUR_TEMPORARY_POSTGRES_CONNECTION_STRING'
export PILOT_DB_SSL=true
node scripts/preflight_pilot.mjs
```

Apply the schema and migrations, load only synthetic pilot data, then run:

```bash
node scripts/pilot_verify.mjs
```

For restore testing, use a disposable pilot database only:

```bash
PILOT_RESTORE_CONFIRM=YES DATABASE_URL='DISPOSABLE_PILOT_DB' \
  ./scripts/restore.sh ./backups/magra_school_YYYYMMDDTHHMMSSZ.dump
```

## Boundary

This release hardening does **not** claim that Supabase/PostgreSQL, domain, DNS, HTTPS, or production hosting has been connected. Those require the actual pilot/production connection details and a browser-level acceptance run.
