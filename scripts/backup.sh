#!/usr/bin/env bash
set -euo pipefail
umask 077
: "${DATABASE_URL:?DATABASE_URL is required}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
mkdir -p "$BACKUP_DIR"
ts="$(date -u +%Y%m%dT%H%M%SZ)"
out="$BACKUP_DIR/magra_school_${ts}.dump"
pg_dump "$DATABASE_URL" --format=custom --no-owner --file="$out"
sha256sum "$out" > "$out.sha256"
find "$BACKUP_DIR" -type f -name 'magra_school_*.dump' -mtime "+$RETENTION_DAYS" -delete
find "$BACKUP_DIR" -type f -name 'magra_school_*.dump.sha256' -mtime "+$RETENTION_DAYS" -delete
echo "Backup created: $out"
