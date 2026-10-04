# Temporary PostgreSQL options for pilot testing

The pilot should use a temporary PostgreSQL project, not the school's future production database.

## Option A — Supabase Free
Supabase currently provides a dedicated PostgreSQL database on its Free plan, with 500 MB database size per project and up to two active free projects. Free projects can pause after inactivity. This is suitable for a small pilot, not as the final school production database.

## Option B — Neon Free
Neon currently provides PostgreSQL on its Free plan with scale-to-zero, 0.5 GB storage per project, and a limited monthly compute allowance. It is also suitable for a small pilot.

## Option C — Render Free PostgreSQL
Render currently offers Free Postgres for testing, but its Free Postgres database expires after 30 days and has no backups. It is therefore less suitable if the pilot will run for a long time.

### Recommendation for this pilot
Use **one temporary Supabase Free or Neon Free PostgreSQL project**, keep only pilot records, and export a backup before the pilot expires/ends. Do not use it for permanent school records.

Production should later use a paid PostgreSQL service with backups, monitoring, recovery and appropriate access controls.
