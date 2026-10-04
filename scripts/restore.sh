#!/usr/bin/env bash
set -euo pipefail
umask 077
: "${DATABASE_URL:?DATABASE_URL is required}"
: "${1:?Usage: PILOT_RESTORE_CONFIRM=YES ./scripts/restore.sh backups/file.dump}"
DUMP="$1"
[ -f "$DUMP" ] || { echo "Backup not found: $DUMP" >&2; exit 1; }

# Restore is destructive. Never allow it against a production environment.
if [ "${NODE_ENV:-development}" = "production" ]; then
  echo "Refusing destructive restore with NODE_ENV=production." >&2
  exit 1
fi
if [ "${PILOT_RESTORE_CONFIRM:-}" != "YES" ]; then
  echo "Refusing destructive restore. Set PILOT_RESTORE_CONFIRM=YES for a disposable pilot database." >&2
  exit 1
fi

if [ -f "$DUMP.sha256" ]; then sha256sum -c "$DUMP.sha256"; fi
pg_restore "$DATABASE_URL" --clean --if-exists --no-owner --exit-on-error "$DUMP"
echo "Restore completed from: $DUMP"
