# V19 — Security, backup & recovery hardening

## Production requirements
- Set `NODE_ENV=production`.
- Set a unique `JWT_SECRET` with at least 32 characters (64+ recommended).
- Set an explicit `CORS_ORIGIN` allowlist; do not use `*`.
- Set a real PostgreSQL `DATABASE_URL`.
- Run the database migrations before starting the API.
- Keep backups outside the web root and restrict access to the backup host/storage.

## Health checks
- `GET /health` checks API + database connectivity.
- `GET /ready` is a lightweight readiness probe.

## Backup
`DATABASE_URL=... ./scripts/backup.sh`

Optional:
- `BACKUP_DIR=/secure/backups`
- `RETENTION_DAYS=30`

Each backup receives a SHA-256 checksum file.

## Restore
1. Confirm the backup file and checksum.
2. Stop application traffic or place it in maintenance mode.
3. Run `DATABASE_URL=... ./scripts/restore.sh backups/file.dump`.
4. Run `GET /health` and verify core modules.
5. Re-enable traffic.

## Security notes
- Institution EIIN is an identifier, not a shared password.
- Use individual accounts and role-based access.
- Never commit `.env`, production secrets, database dumps, or credentials.
- Rotate credentials immediately if exposed.
